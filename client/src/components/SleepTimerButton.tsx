import { useState, useEffect, useRef } from 'react';
import { Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SleepTimerButtonProps {
  /** Chamado quando o tempo do temporizador termina — deve pausar tudo que estiver tocando */
  onTimerEnd: () => void;
}

const OPTIONS = [15, 30, 45, 60];

/**
 * Botão de temporizador para dormir: pausa a reprodução automaticamente
 * depois de X minutos. Mostra o tempo restante enquanto ativo.
 */
export const SleepTimerButton = ({ onTimerEnd }: SleepTimerButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remainingLabel, setRemainingLabel] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const startTimer = (minutes: number) => {
    clearTimer();
    const end = Date.now() + minutes * 60 * 1000;
    setEndAt(end);
    setShowMenu(false);

    timeoutRef.current = setTimeout(() => {
      onTimerEnd();
      setEndAt(null);
      clearTimer();
    }, minutes * 60 * 1000);

    intervalRef.current = setInterval(() => {
      const msLeft = end - Date.now();
      if (msLeft <= 0) {
        setRemainingLabel('');
        return;
      }
      const mins = Math.floor(msLeft / 60000);
      const secs = Math.floor((msLeft % 60000) / 1000);
      setRemainingLabel(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
  };

  const cancelTimer = () => {
    clearTimer();
    setEndAt(null);
    setShowMenu(false);
  };

  useEffect(() => clearTimer, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(v => !v)}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all",
          endAt ? "bg-purple-500/30 text-purple-200 border border-purple-400/40" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
        )}
      >
        <Moon size={12} />
        {endAt ? remainingLabel : 'Soneca'}
      </button>

      {/* Este menu fica SEMPRE montado no DOM (nunca removido
          condicionalmente) — apenas escondido via CSS quando showMenu é
          false. Desmontar/remontar esse tipo de overlay no exato momento
          de um clique interno já causou crashes de 'removeChild' em
          outro lugar do app; manter sempre presente evita o problema. */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity",
          showMenu ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setShowMenu(false)}
      >
        <div
          className="absolute right-4 top-12 bg-white rounded-xl shadow-2xl p-2 w-40"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-[10px] text-gray-500 px-2 pt-1 pb-2 font-semibold">Pausar em...</p>
          {OPTIONS.map(min => (
            <button
              key={min}
              onClick={() => startTimer(min)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-gray-800 hover:bg-purple-50"
            >
              {min} minutos
            </button>
          ))}
          {endAt && (
            <button
              onClick={cancelTimer}
              className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-1 border-t border-gray-100"
            >
              Cancelar temporizador
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
