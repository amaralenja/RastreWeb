import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from './lib/supabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Sessions from './pages/Sessions';
import Heatmaps from './pages/Heatmaps';
import Billing from './pages/Billing';
import SessionPlayerModal from './components/SessionPlayerModal';
import {
  LayoutDashboard,
  Video,
  Globe,
  Layers,
  CreditCard,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Plus,
  Bell
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [account, setAccount] = useState({
    name: 'Minha Conta SaaS',
    plan: 'trial',
    monthly_session_quota: 1000,
    sessions_used_this_cycle: 3,
  });
  const [projects, setProjects] = useState([
    {
      id: 'proj_1',
      name: 'Meu E-commerce Principal',
      domain: 'lojaexemplo.com.br',
      site_key: 'site_8a7f92b10c4d',
      is_active: true,
    },
    {
      id: 'proj_2',
      name: 'Landing Page de Vendas',
      domain: 'lp.lojaexemplo.com.br',
      site_key: 'site_3e5d19a48f6b',
      is_active: true,
    },
  ]);
  const [selectedProjectId, setSelectedProjectId] = useState('proj_1');
  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      session_id: 'sess_99a81bc3d2',
      page_entry: 'https://lojaexemplo.com.br/produto/12',
      device: 'desktop',
      browser: 'Chrome',
      duration_seconds: 48,
      rage_click: true,
      started_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'sess_2',
      session_id: 'sess_44e10df8aa',
      page_entry: 'https://lojaexemplo.com.br/checkout',
      device: 'mobile',
      browser: 'Safari',
      duration_seconds: 92,
      rage_click: false,
      started_at: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'sess_3',
      session_id: 'sess_12c98ef710',
      page_entry: 'https://lojaexemplo.com.br/',
      device: 'desktop',
      browser: 'Firefox',
      duration_seconds: 24,
      rage_click: false,
      started_at: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ]);

  const [activePlayerSession, setActivePlayerSession] = useState(null);

  // Load user session on mount
  useEffect(() => {
    if (!isConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadUserData = async (currentUser) => {
    try {
      // Load accounts for current auth user (multi-tenant RLS)
      const { data: accData } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_user_id', currentUser.id)
        .maybeSingle();

      if (accData) {
        setAccount(accData);

        // Load projects for this account
        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .eq('account_id', accData.id);

        if (projData && projData.length > 0) {
          setProjects(projData);
          setSelectedProjectId(projData[0].id);

          // Load sessions
          const { data: sessData } = await supabase
            .from('sessions')
            .select('*')
            .eq('account_id', accData.id)
            .order('started_at', { ascending: false });

          if (sessData) {
            setSessions(sessData);
          }
        }
      }
    } catch (err) {
      console.warn('Carregamento de dados do Supabase:', err);
    }
  };

  const handleCreateProject = async (newProj) => {
    const siteKey = 'site_' + Math.random().toString(36).substring(2, 14);
    const createdObj = {
      id: 'proj_' + Date.now(),
      name: newProj.name,
      domain: newProj.domain,
      site_key: siteKey,
      is_active: true,
    };

    if (isConfigured && user) {
      try {
        const { data, error } = await supabase.from('projects').insert({
          account_id: account.id,
          name: newProj.name,
          domain: newProj.domain,
          site_key: siteKey,
        }).select().single();

        if (data) {
          setProjects((prev) => [...prev, data]);
          setSelectedProjectId(data.id);
          return;
        }
      } catch (err) {
        console.error('Erro ao salvar projeto no Supabase:', err);
      }
    }

    setProjects((prev) => [...prev, createdObj]);
    setSelectedProjectId(createdObj.id);
  };

  const handleDeleteProject = (projId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projId));
  };

  const handleUpgradePlan = (planId) => {
    const quotaMap = { trial: 1000, starter: 10000, pro: 50000, scale: 200000 };
    setAccount((prev) => ({
      ...prev,
      plan: planId,
      monthly_session_quota: quotaMap[planId] || 1000,
    }));
    alert(`Plano atualizado para ${planId.toUpperCase()} com sucesso!`);
  };

  const handleLogout = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={(u) => setUser(u)} />;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-500 rounded-xl border border-blue-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base tracking-tight leading-none">RastreWeb</h1>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide">SaaS Multi-tenant</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard size={16} /> Visão Geral
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Video size={16} /> Gravações (Replays)
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'projects'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Globe size={16} /> Sites & Snippet
            </button>

            <button
              onClick={() => setActiveTab('heatmaps')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'heatmaps'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Layers size={16} /> Heatmaps
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'billing'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <CreditCard size={16} /> Planos & Quotas
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.user_metadata?.name || user.email}</p>
              <p className="text-[10px] text-slate-400 capitalize">Plano {account?.plan || 'trial'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-8 flex items-center justify-between shrink-0">
          
          {/* Active Project Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Projeto Ativo:</span>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-500 pr-8 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.domain || 'sem domínio'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
              Ingestão Online
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              account={account}
              projects={projects}
              sessions={sessions}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'sessions' && (
            <Sessions
              sessions={sessions}
              onPlaySession={(s) => setActivePlayerSession(s)}
            />
          )}

          {activeTab === 'projects' && (
            <Projects
              projects={projects}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeTab === 'heatmaps' && <Heatmaps projects={projects} />}

          {activeTab === 'billing' && (
            <Billing account={account} onUpgradePlan={handleUpgradePlan} />
          )}
        </main>
      </div>

      {/* Session Player Modal */}
      {activePlayerSession && (
        <SessionPlayerModal
          session={activePlayerSession}
          onClose={() => setActivePlayerSession(null)}
        />
      )}
    </div>
  );
}
