import React, { useState } from 'react';
import { Globe, Plus, Copy, Check, Code, Trash2, CheckCircle2 } from 'lucide-react';

export default function Projects({ projects, onCreateProject, onDeleteProject }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name) return;
    onCreateProject({
      name,
      domain: domain.replace(/^https?:\/\//, ''),
    });
    setName('');
    setDomain('');
    setShowModal(false);
  };

  const copySnippet = (siteKey) => {
    const snippet = `<script src="${window.location.origin}/loader.js" data-site="${siteKey}" async></script>`;
    navigator.clipboard.writeText(snippet);
    setCopiedKey(siteKey);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sites & Projetos Cadastrados</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie os domínios que você rastreia e obtenha o snippet de instalação para cada site.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} /> Novo Site
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((proj) => {
            const isCopied = copiedKey === proj.site_key;
            const snippetText = `<script src="${window.location.origin}/loader.js" data-site="${proj.site_key}" async></script>`;

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Globe size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{proj.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{proj.domain || 'Dominio não especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ativo
                      </span>
                      {onDeleteProject && (
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Excluir projeto"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Site Key Badge */}
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-400 truncate">Site Key: <strong className="text-slate-900 dark:text-slate-200">{proj.site_key}</strong></span>
                  </div>
                </div>

                {/* Code Snippet Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Code size={14} /> Snippet HTML de Instalação
                    </span>
                    <button
                      onClick={() => copySnippet(proj.site_key)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          <span className="text-emerald-500">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copiar Código</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto break-all select-all">
                    {snippetText}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <Globe size={40} className="mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Nenhum site cadastrado ainda</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Cadastre seu primeiro projeto para obter o snippet de rastreamento e começar a gravar sessões.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium inline-flex items-center gap-2"
            >
              <Plus size={16} /> Cadastrar Meu Primeiro Site
            </button>
          </div>
        )}
      </div>

      {/* Modal Novo Projeto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Cadastrar Novo Site</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Informe o nome do site e o domínio onde o script será instalado.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Meu E-commerce, Landing Page"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Domínio do Site</label>
                <input
                  type="text"
                  placeholder="meusite.com.br"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
                >
                  Criar e Gerar Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
