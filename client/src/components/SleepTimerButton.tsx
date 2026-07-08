import { useState, useEffect, useRef } from 'react';
import { Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SleepTimerButtonProps {
  /** Chamado quando o tempo do temporizador termina — deve pausar tudo que estiver tocando */
  onTimerEnd: () => void;
}

/**
 * Botão de temporizador para dormir: pausa a reprodução automaticamente
 * depois de X minutos. Usa um <select> nativo do navegador em vez de um
 * menu popup customizado — evita qualquer conflito de reconciliação do
 * React com a exibição/ocultação de um overlay próprio, que causava
 * crashes em alguns celulares.
 */
export const SleepTimerButton = ({ onTimerEnd }: SleepTimerButtonProps) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'cancel') {
      clearTimer();
      setEndAt(null);
      setRemainingLabel('');
    } else if (value !== 'off') {
      startTimer(Number(value));
    }
    // Reseta o <select> para o valor de placeholder logo em seguida —
    // ele serve só como um seletor de ação, não deve "guardar" o tempo
    // escolhido nem ficar atualizando (isso causava o menu nativo do
    // sistema piscar a cada segundo, já que o texto mudava toda hora).
    e.target.value = 'off';
  };

  useEffect(() => clearTimer, []);

  return (
    <div
      className={cn(
        "relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all",
        endAt ? "bg-purple-500/30 text-purple-200 border border-purple-400/40" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
      )}
    >
      <Moon size={12} className="pointer-events-none" />
      <span className="pointer-events-none">{endAt ? remainingLabel : 'Soneca'}</span>
      {/* <select> nativo nao-controlado: serve só como um seletor de ação
          (escolher/cancelar), sempre volta pro placeholder depois de cada
          escolha. O contador regressivo fica isolado no <span> acima,
          fora do menu — assim o menu nativo nunca precisa ser atualizado
          a cada segundo. */}
      <select
        defaultValue="off"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Temporizador de soneca"
      >
        <option value="off">Escolher tempo...</option>
        <option value="15">15 minutos</option>
        <option value="30">30 minutos</option>
        <option value="45">45 minutos</option>
        <option value="60">60 minutos</option>
        {endAt && <option value="cancel">Cancelar temporizador</option>}
      </select>
    </div>
  );
};
