import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

createRoot(document.getElementById("root")!).render(<App />);

// Registra o Service Worker e força a atualização para a versão mais
// recente automaticamente (combinado com skipWaiting/clientsClaim no
// vite.config.ts). Isso evita que o app fique "preso" numa versão antiga
// em cache mesmo após novos deploys.
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Nova versão disponível: ativa imediatamente e recarrega a página
      updateSW(true);
    },
    onRegisterError(error) {
      console.error('Erro ao registrar o Service Worker:', error);
    },
  });
}
