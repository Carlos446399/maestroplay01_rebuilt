import { useEffect, useState } from 'react';
import { Music2, HardDrive, Radio, Star, Users, Plus } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

const features = [
  { icon: Music2, label: 'Suas músicas', color: 'text-purple-400' },
  { icon: HardDrive, label: 'Google Drive', color: 'text-green-400' },
  { icon: Radio, label: 'Rádios ao vivo', color: 'text-blue-400' },
  { icon: Star, label: 'Favoritos', color: 'text-yellow-400' },
  { icon: Users, label: 'Artistas', color: 'text-red-400' },
  { icon: Plus, label: 'Playlists', color: 'text-pink-400' },
];

export const SplashScreen = ({ onEnter }: SplashScreenProps) => {
  const [visible, setVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    // Animação em cascata
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setLogoVisible(true), 400);
    const t3 = setTimeout(() => setFeaturesVisible(true), 900);
    const t4 = setTimeout(() => setBtnVisible(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      {/* Partículas de fundo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#a855f7', '#ec4899', '#3b82f6', '#10b981'][i % 4],
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Círculo decorativo grande */}
      <div
        className="absolute"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          top: '-200px',
          right: '-200px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          bottom: '-150px',
          left: '-150px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 w-full">
        {/* Logo */}
        <div
          className="flex flex-col items-center mb-10 transition-all duration-700"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Ícone animado */}
          <div
            className="relative mb-5"
            style={{
              width: '100px',
              height: '100px',
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                boxShadow: '0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(236,72,153,0.3)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Music2 size={52} className="text-white" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
            </div>
            {/* Pulso */}
            <div
              className="absolute inset-0 rounded-2xl animate-ping"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                opacity: 0.2,
              }}
            />
          </div>

          <h1
            className="text-white font-black tracking-tight text-center"
            style={{
              fontSize: '38px',
              letterSpacing: '-1px',
              textShadow: '0 2px 20px rgba(168,85,247,0.5)',
            }}
          >
            Maestro<span style={{ color: '#a855f7' }}>Play</span>
          </h1>
          <p className="text-purple-300 text-sm mt-1 font-medium tracking-widest uppercase">
            Sua música, em todo lugar
          </p>
        </div>

        {/* Divisor */}
        <div
          className="w-16 h-0.5 mb-8 rounded-full transition-all duration-700"
          style={{
            background: 'linear-gradient(90deg, transparent, #a855f7, #ec4899, transparent)',
            opacity: featuresVisible ? 1 : 0,
          }}
        />

        {/* Cards de features */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-2">
          {features.map((f, i) => (
            <div
              key={f.label}
              className="flex flex-col items-center p-3 rounded-xl transition-all duration-500"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                opacity: featuresVisible ? 1 : 0,
                transform: featuresVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <f.icon size={22} className={f.color} />
              <span className="text-white/70 text-[10px] mt-1.5 font-medium text-center leading-tight">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Botão de entrar */}
      <div
        className="w-full px-8 pb-12 transition-all duration-700"
        style={{
          opacity: btnVisible ? 1 : 0,
          transform: btnVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        <button
          onClick={onEnter}
          className="w-full py-4 rounded-2xl font-bold text-white text-base relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            boxShadow: '0 8px 32px rgba(168,85,247,0.4)',
            letterSpacing: '0.5px',
          }}
        >
          <span className="relative z-10">Começar a ouvir</span>
          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, white 50%, transparent 60%)',
            }}
          />
        </button>

        <p className="text-center text-white/30 text-xs mt-4">
          MaestroPlay · Todos os géneros musicais
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};
