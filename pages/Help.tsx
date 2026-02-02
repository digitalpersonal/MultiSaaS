
import React, { useState } from 'react';
import { HelpCircle, BookOpen, Zap, ShieldCheck, FileSpreadsheet, ChevronRight, AlertCircle, CheckCircle2, Package, Wrench, DollarSign, ArrowRight } from 'lucide-react';

export const Help: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'GENERAL' | 'FISCAL' | 'OPERATIONAL'>('GENERAL');

  const sections = [
    { id: 'GENERAL', label: 'Primeiros Passos', icon: <BookOpen size={18} /> },
    { id: 'FISCAL', label: 'Bling & Fiscal', icon: <ShieldCheck size={18} /> },
    { id: 'OPERATIONAL', label: 'Fluxo Operacional', icon: <Zap size={18} /> }
  ];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Central de Conhecimento</h1>
        <p className="text-slate-500 font-medium text-lg">Aprenda a operar o Multiplus e integrar seu ERP de forma profissional.</p>
      </div>

      <div className="flex justify-center gap-2 p-1.5 bg-slate-100 rounded-[2rem] w-fit mx-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id as any)} className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === s.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeSection === 'FISCAL' && (
          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl shrink-0"><AlertCircle size={32} /></div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase mb-4">Guia de Integração Bling (ERP)</h2>
                <p className="text-slate-600 leading-relaxed font-medium">O Multiplus foi desenhado para alimentar o Bling sem erros. Para garantir que suas Notas Fiscais (NF-e/NFS-e) sejam emitidas corretamente, siga estas regras de ouro:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 font-black uppercase text-[10px] tracking-widest"><Package size={16}/> 1. Padronização de SKU</div>
                <p className="text-sm text-slate-600 leading-relaxed">O <strong>SKU (Stock Keeping Unit)</strong> é o DNA do seu produto. Nunca duplique um SKU. Ao importar para o Bling, o sistema usará este código para vincular os itens. No Multiplus, o SKU é obrigatório.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 font-black uppercase text-[10px] tracking-widest"><FileSpreadsheet size={16}/> 2. Categorias Contábeis</div>
                <p className="text-sm text-slate-600 leading-relaxed">Utilize as categorias fiscais (Informatica, Mão de Obra, etc) idênticas às cadastradas no Bling. Isso evita que o ERP rejeite a importação por "Categoria Inexistente".</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase"><CheckCircle2 className="text-emerald-500" size={24}/> Checklist para Emissão de Notas</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   'Verificar se o cliente possui CPF/CNPJ válido no CRM.',
                   'Garantir que o produto tem NCM configurado no ERP.',
                   'Confirmar se a OS tem valor definido antes de exportar.',
                   'Sincronizar o estoque via exportação CSV mensal.'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs font-bold text-emerald-800">
                     <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0">{i+1}</span>
                     {item}
                   </li>
                 ))}
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'OPERATIONAL' && (
          <div className="space-y-12">
            <h2 className="text-2xl font-black text-slate-900 uppercase text-center mb-8">O Ciclo de Vida do Serviço</h2>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 hidden md:block -z-10"></div>
               {[
                 { step: 'Recepção', icon: <Package />, text: 'O item entra no sistema com Checklist inicial.', color: 'bg-blue-600' },
                 { step: 'Orçamento', icon: <FileSpreadsheet />, text: 'O técnico avalia e gera o orçamento para o cliente.', color: 'bg-violet-600' },
                 { step: 'Oficina', icon: <Wrench />, text: 'Após aprovação, o item entra em reparo efetivo.', color: 'bg-indigo-600' },
                 { step: 'Entrega', icon: <CheckCircle2 />, text: 'O cliente retira e o financeiro é liquidado.', color: 'bg-emerald-600' }
               ].map((s, i) => (
                 <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm w-full md:w-48 text-center flex flex-col items-center gap-4 relative">
                    <div className={`w-14 h-14 ${s.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>{s.icon}</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.step}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">{s.text}</p>
                 </div>
               ))}
            </div>
            
            <div className="p-8 bg-indigo-50 rounded-[3rem] border border-indigo-100 flex items-center gap-8">
               <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-indigo-200"><DollarSign size={32}/></div>
               <div>
                  <h3 className="text-lg font-black text-indigo-900 uppercase mb-2">Ponte Financeira Contábil</h3>
                  <p className="text-sm text-indigo-700 font-medium leading-relaxed">Cada venda ou serviço finalizado gera automaticamente um lançamento no Fluxo de Caixa. No fim do mês, use a <strong>Exportação Contábil</strong> para enviar tudo ao seu contador em segundos.</p>
               </div>
            </div>
          </div>
        )}

        {activeSection === 'GENERAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase">Perguntas Frequentes</h2>
              <div className="space-y-4">
                 {[
                   { q: 'Como cadastrar um novo técnico?', a: 'Acesse o menu Equipe & RH e adicione um novo colaborador com perfil Técnico.' },
                   { q: 'Posso usar o PDV para serviços?', a: 'Sim, basta cadastrar o serviço no Catálogo e selecioná-lo na venda rápida.' },
                   { q: 'O sistema funciona offline?', a: 'Sim, o Multiplus possui tecnologia PWA e salva dados localmente caso a internet caia.' }
                 ].map((faq, i) => (
                   <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-sm font-black text-slate-900 mb-2">{faq.q}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                   </div>
                 ))}
              </div>
            </div>
            <div className="space-y-6 bg-slate-900 p-10 rounded-[3rem] text-white">
               <HelpCircle size={40} className="text-indigo-400 mb-4" />
               <h2 className="text-2xl font-black uppercase tracking-tight">Dica de Especialista</h2>
               <p className="text-slate-400 font-medium italic">"A organização do seu estoque é o que separa uma empresa lucrativa de uma empresa que perde dinheiro. Mantenha seus SKUs limpos e seu inventário sempre batendo com o físico."</p>
               <div className="pt-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black">ST</div>
                  <div>
                    <p className="text-xs font-bold">Silvio T. de Sá Filho</p>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Arquiteto de Sistemas</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
