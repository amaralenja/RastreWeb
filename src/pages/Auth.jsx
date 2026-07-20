import React, { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!isConfigured) {
      // Demo mode bypass login
      setTimeout(() => {
        onLoginSuccess({
          id: 'user_demo_123',
          email: email || 'demo@rastreweb.com',
          user_metadata: { name: name || 'Usuário Demo' },
        });
      }, 500);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (signUpErr) throw signUpErr;
        setMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar seu cadastro.');
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        if (data?.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      id: 'user_demo_123',
      email: 'demo@rastreweb.com',
      user_metadata: { name: 'Cliente RastreWeb' },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative gradient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 mb-3">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">RastreWeb</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isSignUp ? 'Crie sua conta SaaS multi-tenant' : 'Acesse o painel do seu produto'}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
            <span>Modo de Demonstração ativo</span>
            <button
              onClick={handleDemoLogin}
              type="button"
              className="px-2 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 transition-colors"
            >
              Entrar sem Login
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Nome Completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome ou nome da empresa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail Profissional</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seunome@empresa.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta SaaS' : 'Entrar no Painel'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800/60 pt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isSignUp ? 'Já possui uma conta? Faça Login' : 'Não tem conta? Cadastre sua empresa'}
          </button>
        </div>
      </div>
    </div>
  );
}
