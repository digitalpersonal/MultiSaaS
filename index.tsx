
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import { AlertTriangle } from 'lucide-react';

// --- Sentry Initialization ---
// O DSN deve ser adicionado como uma variável de ambiente na sua plataforma de hospedagem (Vercel).
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Para proteger a privacidade do usuário, você pode mascarar textos e bloquear mídias.
      // Defina como 'false' para ter visibilidade total durante a depuração.
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
  // Monitoramento de Performance
  tracesSampleRate: 1.0, // Captura 100% das transações para monitoramento de performance.
  // Session Replay
  replaysSessionSampleRate: 0.1, // Taxa de amostragem de 10%. Aumente para 1.0 durante o desenvolvimento.
  replaysOnErrorSampleRate: 1.0, // Captura 100% das sessões onde ocorrem erros.
});

// Componente de fallback profissional para quando a aplicação quebra.
const SentryFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
    <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl max-w-lg">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={40} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Ops! Algo deu errado.</h1>
      <p className="text-slate-500 font-medium mt-4">
        Nossa equipe de engenharia já foi notificada sobre o problema. Por favor, tente recarregar a página ou volte mais tarde.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-indigo-700 transition-all"
      >
        Recarregar a Página
      </button>
    </div>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<SentryFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);