import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS Headers for cross-origin ingestion from any domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas na Vercel.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Safely parse body if sent as raw text or JSON string via sendBeacon
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Payload JSON inválido' });
      }
    }

    body = body || {};

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
      viewport_width
    } = body;

    if (!site_key || !session_id) {
      return res.status(400).json({ error: 'site_key e session_id são obrigatórios' });
    }

    // 1. Validate site_key via SECURITY DEFINER function or direct query
    let project = null;
    let monthly_session_quota = 1000;
    let sessions_used_this_cycle = 0;

    const { data: rpcData, error: rpcErr } = await supabase.rpc('fn_ingest_validate_site', { p_site_key: site_key });

    if (!rpcErr && rpcData && rpcData.length > 0) {
      project = {
        id: rpcData[0].project_id,
        account_id: rpcData[0].account_id,
        is_active: rpcData[0].is_active,
      };
      monthly_session_quota = rpcData[0].monthly_session_quota || 1000;
      sessions_used_this_cycle = rpcData[0].sessions_used_this_cycle || 0;
    } else {
      // Fallback query
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('id, account_id, is_active')
        .eq('site_key', site_key)
        .maybeSingle();

      if (projData) {
        project = projData;
        const { data: accData } = await supabase
          .from('accounts')
          .select('monthly_session_quota, sessions_used_this_cycle')
          .eq('id', projData.account_id)
          .maybeSingle();

        if (accData) {
          monthly_session_quota = accData.monthly_session_quota || 1000;
          sessions_used_this_cycle = accData.sessions_used_this_cycle || 0;
        }
      }
    }

    if (!project || !project.is_active) {
      return res.status(403).json({ error: `Projeto não encontrado ou inativo para o site_key: ${site_key}` });
    }

    const account_id = project.account_id;
    const project_id = project.id;

    // 2. Quota Check
    if (sessions_used_this_cycle >= monthly_session_quota) {
      return res.status(429).json({ error: 'Limite de quota mensal de sessões atingido' });
    }

    // 3. Save JSON recording to Storage (/recordings/{account_id}/{project_id}/{session_id}.json)
    const storagePath = `${account_id}/${project_id}/${session_id}.json`;

    if (events && events.length > 0) {
      const jsonString = JSON.stringify(events);
      await supabase.storage
        .from('recordings')
        .upload(storagePath, jsonString, {
          contentType: 'application/json',
          upsert: true,
        });
    }

    // 4. Upsert Session metadata record in Postgres `sessions` table
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id, page_count')
      .eq('session_id', session_id)
      .maybeSingle();

    const isNewSession = !existingSession;

    await supabase.from('sessions').upsert(
      {
        session_id: session_id,
        account_id: account_id,
        project_id: project_id,
        page_entry: page_entry || '/',
        device: device || 'desktop',
        browser: browser || 'Unknown',
        started_at: started_at || new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: duration_seconds || 0,
        page_count: isNewSession ? 1 : (existingSession?.page_count || 1),
        rage_click: Boolean(rage_click),
        storage_path: storagePath,
      },
      { onConflict: 'session_id' }
    );

    // 5. Insert Heatmap events if present
    if (heatmap_events && Array.isArray(heatmap_events) && heatmap_events.length > 0) {
      const rows = heatmap_events.map((evt) => ({
        account_id,
        project_id,
        page_path: evt.page_path || '/',
        event_type: evt.event_type || 'click',
        x_percent: evt.x_percent,
        y_percent: evt.y_percent,
        viewport_width: viewport_width || evt.viewport_width,
        session_id: session_id,
      }));

      await supabase.from('heatmap_events').insert(rows);
    }

    // 6. Increment session usage counter if new session
    if (isNewSession) {
      await supabase
        .from('accounts')
        .update({
          sessions_used_this_cycle: sessions_used_this_cycle + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account_id);
    }

    return res.status(200).json({
      success: true,
      session_id,
      is_new: isNewSession,
    });
  } catch (err) {
    console.error('Erro na Ingestão Vercel API:', err);
    return res.status(500).json({ error: err.message || 'Erro interno na ingestão' });
  }
}
