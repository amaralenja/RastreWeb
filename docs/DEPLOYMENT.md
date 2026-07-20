# Guia de Deploy & Configuração — RastreWeb SaaS

Este documento detalha os passos necessários para colocar o **RastreWeb** em produção no Supabase e na Vercel.

---

## 1. Configurar o Banco de Dados no Supabase

1. Acesse o painel do seu projeto no [Supabase](https://supabase.com).
2. Vá em **SQL Editor** e execute o conteúdo do arquivo [`supabase/schema.sql`](file:///c:/Users/amara/Downloads/RastreWeb/supabase/schema.sql).
3. O script criará:
   - As tabelas `accounts`, `projects`, `sessions` e `heatmap_events`.
   - As políticas de **Row Level Security (RLS)** garantindo o isolamento entre assinantes do SaaS.
   - O trigger automático para criação da conta (`account`) quando um novo usuário se cadastrar.
   - O bucket privado de storage chamado `recordings`.

---

## 2. Deploy da Supabase Edge Function (`ingest-session`)

1. Instale a CLI do Supabase no seu computador:
   ```bash
   npm install -g supabase
   ```
2. Faça login na sua conta Supabase via terminal:
   ```bash
   supabase login
   ```
3. Vincule este repositório ao seu projeto Supabase:
   ```bash
   supabase link --project-ref SEU_PROJECT_REF
   ```
4. Faça o deploy da Edge Function de ingestão de sessões:
   ```bash
   supabase functions deploy ingest-session --no-verify-jwt
   ```
   *Nota: A flag `--no-verify-jwt` é necessária porque a ingestão é feita pelo script público `loader.js` instalado no site dos seus clientes sem token de usuário logado.*

---

## 3. Variáveis de Ambiente no Painel Front-end (Vercel)

Configure as seguintes variáveis de ambiente no projeto da Vercel / `.env.local`:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Instalação do Snippet no Site do Cliente

Cada cliente do SaaS acessa a aba **Sites & Snippet** no painel, cadastra seu domínio e copia a tag `<script>`:

```html
<script src="https://seu-dominio-saas.com/loader.js" data-site="site_8a7f92b10c4d" async></script>
```

---

## 5. Arquitetura de Cobrança / Stripe (Opcional - Fase 2)

No arquivo [`supabase/schema.sql`](file:///c:/Users/amara/Downloads/RastreWeb/supabase/schema.sql), os campos `stripe_customer_id` e `stripe_subscription_status` já estão definidos na tabela `accounts`. Ao integrar os Webhooks do Stripe (`customer.subscription.created`, `customer.subscription.updated`), atualize o campo `monthly_session_quota` conforme o plano assinado.
