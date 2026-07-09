import { useState, useEffect } from 'react';
import { MobileMusicPlayer } from '@/components/MobileMusicPlayer';
import { SplashScreen } from '@/components/SplashScreen';

const SESSION_SPLASH_KEY = 'maestroplay_splash_shown_this_session';
const AUTO_DISMISS_MS = 3000;

export default function Home() {
  // Mostra a tela de splash uma vez por sessão do navegador (aba/app
  // aberto). Usamos sessionStorage em vez de sempre true: se o
  // ErrorBoundary precisar se recuperar de um erro transitório e
  // remontar este componente, a splash não aparece de novo do nada —
  // só reaparece se o app for realmente reaberto/recarregado de verdade.
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem(SESSION_SPLASH_KEY);
  });

  const handleEnter = () => {
    sessionStorage.setItem(SESSION_SPLASH_KEY, '1');
    setShowSplash(false);
  };

  // Fecha sozinha depois de alguns segundos, sem precisar clicar no botão
  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(handleEnter, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [showSplash]);

  return (
    <>
      {showSplash && <SplashScreen onEnter={handleEnter} />}
      <MobileMusicPlayer />
    </>
  );
}
