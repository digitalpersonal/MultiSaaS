
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

/**
 * MOTOR DE CONEXÃO MULTIPLUS V14 - RESILIÊNCIA TOTAL
 * 
 * Este módulo utiliza uma estratégia de captura multi-origem para garantir
 * que as chaves do Supabase sejam detectadas independentemente de como
 * o ambiente de build (Vite/Vercel/Cloudflare) as disponibiliza.
 */

// Função auxiliar para validar e limpar strings de ambiente
const clean = (val: any): string | undefined => {
  if (typeof val !== 'string') return undefined;
  const s = val.trim().replace(/['"]/g, '');
  return (s === 'undefined' || s === 'null' || s === '') ? undefined : s;
};

// 1. Captura via process.env (Padrão funcional detectado no Gemini/Sentry)
const P_URL = typeof process !== 'undefined' ? (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) : undefined;
const P_KEY = typeof process !== 'undefined' ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) : undefined;

// 2. Captura via import.meta.env (Padrão Vite/ESM)
// @ts-ignore
const M_URL = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_URL : undefined;
// @ts-ignore
const M_KEY = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_ANON_KEY : undefined;

// 3. Captura via Global Window (Fallback para injeções externas)
const G_URL = typeof window !== 'undefined' ? (window as any).VITE_SUPABASE_URL || (window as any).SUPABASE_URL : undefined;
const G_KEY = typeof window !== 'undefined' ? (window as any).VITE_SUPABASE_ANON_KEY || (window as any).SUPABASE_ANON_KEY : undefined;

// Resolução por precedência de confiabilidade
const supabaseUrl = clean(P_URL) || clean(M_URL) || clean(G_URL);
const supabaseAnonKey = clean(P_KEY) || clean(M_KEY) || clean(G_KEY);

// Diagnóstico de Conexão
if (!supabaseUrl || !supabaseAnonKey) {
  console.group('⚠️ MULTIPLUS CLOUD: FALHA DE INJEÇÃO');
  console.warn('As chaves de conexão não foram encontradas no bundle Javascript.');
  console.table({
    'Detectado via Process': !!clean(P_URL),
    'Detectado via Meta': !!clean(M_URL),
    'Detectado via Window': !!clean(G_URL)
  });
  console.info('Ação: Verifique as Variáveis de Ambiente no painel da Vercel e realize um Redeploy com "Clean Cache".');
  console.groupEnd();
} else {
  console.log('🚀 MULTIPLUS CLOUD: CONECTADO (V14)');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isCloudEnabled = () => !!supabase;
