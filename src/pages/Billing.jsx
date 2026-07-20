import React from 'react';
import { Check, ShieldCheck, Zap, CreditCard, Sparkles, ArrowRight } from 'lucide-react';

export default function Billing({ account, onUpgradePlan }) {
  const currentPlan = account?.plan || 'trial';

  const plans = [
    {
      id: 'trial',
      name: 'Trial / Gratuito',
      price: 'R$ 0',
      period: '/mês',
      quota: 1000,
      features: [
        '1.000 gravações de sessão/mês',
        '1 site cadastrado',
        'Retenção de 7 dias de dados',
        'Filtro básico de rage clicks',
        'LGPD Input Masking padrão',
      ],
      buttonText: 'Plano Atual',
      active: currentPlan === 'trial',
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 'R$ 97',
      period: '/mês',
      quota: 10000,
      features: [
        '10.000 gravações de sessão/mês',
        'Até 3 sites cadastrados',
        'Retenção de 30 dias de dados',
        'Heatmaps de cliques & scroll',
        'Exportação de dados em CSV',
        'Suporte por e-mail prioritário',
      ],
      buttonText: 'Fazer Upgrade',
      popular: true,
      active: currentPlan === 'starter',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 247',
      period: '/mês',
      quota: 50000,
      features: [
        '50.000 gravações de sessão/mês',
        'Até 10 sites cadastrados',
        'Retenção de 90 dias de dados',
        'Heatmaps & Rage Click Alerts',
        'Sampling configurável por site',
        'Integração via Webhook/API',
      ],
      buttonText: 'Assinar Pro',
      active: currentPlan === 'pro',
    },
    {
      id: 'scale',
      name: 'Scale',
      price: 'R$ 597',
      period: '/mês',
      quota: 200000,
      features: [
        '200.000 gravações de sessão/mês',
        'Sites ilimitados',
        'Retenção de 365 dias de dados',
        'Gerente de conta dedicado',
        'SLA de 99.9% garantido',
        'Termos LGPD personalizados',
      ],
      buttonText: 'Falar com Vendas',
      active: currentPlan === 'scale',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Planos & Assinatura (Billing Multi-tenant)</h2>
        <p className="text-sm text-slate-400">
          Gerencie a quota de gravações da sua conta e faça upgrade conforme seu tráfego escala.
        </p>
      </div>

      {/* Quota Progress Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Consumo do Ciclo Atual</h3>
            <p className="text-xs text-slate-400">
              Você utilizou <strong>{account?.sessions_used_this_cycle || 0}</strong> de <strong>{account?.monthly_session_quota || 1000}</strong> sessões disponíveis.
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min(Math.round(((account?.sessions_used_this_cycle || 0) / (account?.monthly_session_quota || 1000)) * 100), 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block text-right font-medium">Renova em 30 dias</span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between relative transition-all ${
              p.popular
                ? 'border-blue-500 shadow-xl shadow-blue-500/10'
                : p.active
                ? 'border-emerald-500/50'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <Sparkles size={12} /> Mais Popular
              </span>
            )}

            <div>
              <h3 className="font-semibold text-slate-100 text-base">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-100">{p.price}</span>
                <span className="text-xs text-slate-400 font-medium">{p.period}</span>
              </div>
              <p className="text-xs text-blue-400 font-medium mt-1">{p.quota.toLocaleString('pt-BR')} sessões/mês</p>

              <hr className="my-4 border-slate-800" />

              <ul className="space-y-2.5 text-xs text-slate-300">
                {p.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onUpgradePlan(p.id)}
              disabled={p.active}
              className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                p.active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                  : p.popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {p.active ? 'Plano Ativo' : p.buttonText}
              {!p.active && <ArrowRight size={14} />}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
