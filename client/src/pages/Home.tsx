import { useState, useEffect } from 'react';
import { MobileMusicPlayer } from '@/components/MobileMusicPlayer';
import { SplashScreen } from '@/components/SplashScreen';

const SPLASH_KEY = 'maestroplay_splash_seen';

export default function Home() {
  // Mostra o splash apenas na primeira visita
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem(SPLASH_KEY);
  });

  const handleEnter = () => {
    localStorage.setItem(SPLASH_KEY, '1');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onEnter={handleEnter} />}
      <MobileMusicPlayer />
    </>
  );
}
