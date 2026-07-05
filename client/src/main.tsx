import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

createRoot(document.getElementById("root")!).render(<App />);

// Registra o Service Worker. IMPORTANTE: não forçamos mais um reload
// imediato quando uma nova versão é detectada (`updateSW(true)`), porque
// isso podia acontecer bem no meio de uma interação do usuário (um menu
// sendo aberto, por exemplo) e brigava com o React nesse exato instante,
// causando crashes de "removeChild" — o app parecia quebrar em lugares
// aleatórios (login, temporizador, busca...) mas a causa era sempre essa.
// Agora a nova versão fica pronta em segundo plano e só entra em uso na
// próxima vez que o app for aberto/recarregado naturalmente.
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.error('Erro ao registrar o Service Worker:', error);
    },
  });
}
