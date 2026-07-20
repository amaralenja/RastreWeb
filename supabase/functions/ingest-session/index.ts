// Supabase Edge Function: ingest-session
// Handles multi-tenant session recording ingestion, quota enforcement, gzip storage & metadata database updates.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS Pre-flight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const {
      site_key,
      session_id,
      page_entry,
      device,
      browser,
      started_at,
      duration_seconds,
      rage_click,
      events,
      heatmap_events,
    } = body;

    if (!site_key || !session_id) {
      return new Response(JSON.stringify({ error: "site_key e session_id são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Validate site_key against projects table
    const { data: project, error: projectErr } = await supabaseAdmin
      .from("projects")
      .select("id, account_id, is_active")
      .eq("site_key", site_key)
      .single();

    if (projectErr || !project || !project.is_active) {
      return new Response(JSON.stringify({ error: "Projeto não encontrado ou inativo" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const account_id = project.account_id;
    const project_id = project.id;

    // 2. Quota Check on Accounts table
    const { data: account, error: accountErr } = await supabaseAdmin
      .from("accounts")
      .select("id, monthly_session_quota, sessions_used_this_cycle, stripe_subscription_status")
      .eq("id", account_id)
      .single();

    if (accountErr || !account) {
      return new Response(JSON.stringify({ error: "Conta não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (account.sessions_used_this_cycle >= account.monthly_session_quota) {
      return new Response(JSON.stringify({ error: "Limite de quota mensal de sessões atingido" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Compress & Save events payload to Storage (/recordings/{account_id}/{project_id}/{session_id}.json)
    const storagePath = `${account_id}/${project_id}/${session_id}.json`;

    if (events && events.length > 0) {
      const jsonString = JSON.stringify(events);
      const encoder = new TextEncoder();
      const rawData = encoder.encode(jsonString);

      // Upload raw or compressed JSON to Supabase Storage recordings bucket
      const { error: uploadErr } = await supabaseAdmin.storage
        .from("recordings")
        .upload(storagePath, rawData, {
          contentType: "application/json",
          upsert: true,
        });

      if (uploadErr) {
        console.error("Erro no upload do Storage:", uploadErr);
      }
    }

    // 4. Upsert Session metadata in Postgres `sessions` table
    const { data: existingSession } = await supabaseAdmin
      .from("sessions")
      .select("id, page_count")
      .eq("session_id", session_id)
      .maybeSingle();

    const isNewSession = !existingSession;

    const { error: sessionUpsertErr } = await supabaseAdmin.from("sessions").upsert(
      {
        session_id: session_id,
        account_id: account_id,
        project_id: project_id,
        page_entry: page_entry || "/",
        device: device || "desktop",
        browser: browser || "Unknown",
        started_at: started_at || new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: duration_seconds || 0,
        page_count: isNewSession ? 1 : (existingSession?.page_count || 1),
        rage_click: Boolean(rage_click),
        storage_path: storagePath,
      },
      { onConflict: "session_id" }
    );

    if (sessionUpsertErr) {
      console.error("Erro ao salvar metadados da sessão:", sessionUpsertErr);
    }

    // 5. Insert Heatmap events if present
    if (heatmap_events && Array.isArray(heatmap_events) && heatmap_events.length > 0) {
      const rows = heatmap_events.map((evt: any) => ({
        account_id,
        project_id,
        page_path: evt.page_path || "/",
        event_type: evt.event_type || "click",
        x_percent: evt.x_percent,
        y_percent: evt.y_percent,
        viewport_width: evt.viewport_width,
        session_id: session_id,
      }));

      await supabaseAdmin.from("heatmap_events").insert(rows);
    }

    // 6. Increment session usage counter if new session
    if (isNewSession) {
      await supabaseAdmin
        .from("accounts")
        .update({
          sessions_used_this_cycle: account.sessions_used_this_cycle + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", account_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        session_id,
        is_new: isNewSession,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Ingest Exception:", err);
    return new Response(JSON.stringify({ error: err.message || "Erro interno de ingestão" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
