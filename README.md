# RastreWeb — SaaS Multi-tenant de Session Replay & Heatmap

Plataforma SaaS multi-tenant de gravação de sessões de usuários (estilo Microsoft Clarity / Hotjar), permitindo que clientes cadastrem seus sites, instalem um script leve de rastreamento (`loader.js`) e analisem replays fiéis do DOM e mapas de calor de cliques/scroll.

---

## 🚀 Tecnologias Utilizadas

- **Frontend Painel SaaS**: React 18 + Vite + TailwindCSS + Lucide Icons
- **Player de Replay**: `rrweb-player` / `rrweb`
- **Backend & Autenticação**: Supabase Auth + Postgres com **Row Level Security (RLS)**
- **Ingestão Serverless**: Supabase Edge Function (`ingest-session`) com validação de `site_key` e enforcement de quotas por plano
- **Storage**: Supabase Storage particionado por `account_id/project_id/session_id.json`

---

## 🛠️ Estrutura do Projeto

```text
├── public/
│   └── loader.js               # Script tracker servido via CDN / público (rrweb + rage click)
├── src/
│   ├── components/
│   │   └── SessionPlayerModal.jsx  # Replay player modal com rrweb-player
│   ├── lib/
│   │   └── supabase.js         # Instância do cliente Supabase
│   ├── pages/
│   │   ├── Auth.jsx            # Autenticação de clientes do SaaS
│   │   ├── Dashboard.jsx       # Visão geral de consumo e métricas
│   │   ├── Projects.jsx        # Gestão de sites & Gerador de Snippets <script>
│   │   ├── Sessions.jsx        # Lista e filtro de gravações
│   │   ├── Heatmaps.jsx        # Overlay visual de cliques & rolagem
│   │   └── Billing.jsx         # Planos, quotas de uso e Stripe
│   ├── App.jsx                 # Layout principal, abas e projeto ativo
│   └── main.jsx
├── supabase/
│   ├── schema.sql              # Schema Postgres multi-tenant, RLS, triggers & storage
│   └── functions/
│       └── ingest-session/     # Edge function Deno de ingestão de eventos
└── docs/
    └── DEPLOYMENT.md           # Guia completo de deploy no Supabase e Vercel
```

---

## ⚡ Rodando Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse em seu navegador: [http://localhost:3000](http://localhost:3000)

---

## 🛡️ Segurança e Privacidade (LGPD)

O script `loader.js` utiliza a configuração `maskAllInputs: true` por padrão, mascarando automaticamente quaisquer dados sensíveis ou senhas digitadas nos sites dos seus clientes antes de enviar os eventos para o servidor.
