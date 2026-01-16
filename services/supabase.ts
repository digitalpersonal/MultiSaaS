import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

// Função auxiliar para tentar ler variáveis de ambiente de várias fontes possíveis
// Isso resolve problemas onde o bundler (Vite/Webpack) ou o ambiente (Browser) expõem as vars de formas diferentes.
const getEnv = (key: string): string => {
  // 1. Tenta injetar via Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env[key]) return import.meta.env[key];
      // @ts-ignore
      if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
    }
  } catch (e) {
    // Ignora erros de acesso ao import.meta em ambientes que não suportam
  }

  // 2. Tenta injetar via Process (Node/Webpack/CRA)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[key]) return process.env[key];
      if (process.env[`REACT_APP_${key}`]) return process.env[`REACT_APP_${key}`];
    }
  } catch (e) {
    // Ignora erros se process não estiver definido
  }

  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Log de diagnóstico para ajudar o desenvolvedor
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ MULTIPLUS DIAGNÓSTICO: Credenciais do Supabase não encontradas.');
  console.warn('O sistema entrou em MODO LOCAL (Offline). Os dados não serão sincronizados entre dispositivos.');
  console.log('Verifique se SUPABASE_URL e SUPABASE_ANON_KEY estão definidos no arquivo .env ou no painel da Vercel/Netlify.');
} else {
  console.log('✅ MULTIPLUS: Conexão com Supabase inicializada.');
}

// O cliente só será inicializado se as variáveis estiverem presentes
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isCloudEnabled = () => !!supabase;