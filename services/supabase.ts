
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

// Lógica de conexão robusta para produção:
// Procura pela variável padrão ou por variações com prefixos comuns (VITE_, REACT_APP_).
const supabaseUrl = process.env.SUPABASE_URL || (window as any).VITE_SUPABASE_URL || (window as any).REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || (window as any).VITE_SUPABASE_ANON_KEY || (window as any).REACT_APP_SUPABASE_ANON_KEY;


// Log de diagnóstico aprimorado para ajudar o desenvolvedor
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ MULTIPLUS DIAGNÓSTICO: Credenciais do Supabase não encontradas.');
  console.warn('O sistema não consegue se conectar à nuvem. Verifique se as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY (ou com prefixo VITE_/REACT_APP_) estão configuradas no painel da Vercel/Netlify e se o deploy foi refeito.');
} else {
  console.log('✅ MULTIPLUS: Conexão com Supabase (Modo Produção) inicializada.');
}

// O cliente só será inicializado se as variáveis estiverem presentes
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isCloudEnabled = () => !!supabase;