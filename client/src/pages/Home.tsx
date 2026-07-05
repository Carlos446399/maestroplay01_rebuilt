import { useState } from 'react';
import { MobileMusicPlayer } from '@/components/MobileMusicPlayer';
import { SplashScreen } from '@/components/SplashScreen';

export default function Home() {
  // Mostra a tela de splash toda vez que o app é aberto, dando tempo dos
  // recursos do painel principal carregarem em segundo plano antes de
  // revelar o player.
  const [showSplash, setShowSplash] = useState(true);

  const handleEnter = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onEnter={handleEnter} />}
      <MobileMusicPlayer />
    </>
  );
}
