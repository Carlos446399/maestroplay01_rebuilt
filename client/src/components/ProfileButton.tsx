import { useState } from 'react';
import { LogIn, LogOut, User, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const ProfileButton = () => {
  const { user, isLoading, isConfigured, signIn, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (user) {
    return (
      <>
        {/* Avatar do usuário */}
        <button
          onClick={() => setShowMenu(true)}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500 flex-shrink-0"
        >
          <img
            src={user.picture}
            alt={user.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Menu do perfil */}
        {showMenu && (
          <div
            className="fixed inset-0 z-50 flex items-end"
            onClick={() => setShowMenu(false)}
          >
            <div
              className="w-full bg-white rounded-t-2xl p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho do perfil */}
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-purple-500"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>
                <button onClick={() => setShowMenu(false)} className="text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {/* Divisor */}
              <div className="h-px bg-gray-100 mb-4" />

              {/* Opções */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-800">Conta Google</p>
                    <p className="text-[10px] text-gray-500">Conectado com sucesso</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Sair */}
              <button
                onClick={() => {
                  signOut();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-semibold">Sair da conta</span>
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={signIn}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
        'bg-white/10 text-white hover:bg-white/20 border border-white/20',
        isLoading && 'opacity-60'
      )}
    >
      {isLoading ? (
        <div className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogIn size={12} />
      )}
      {isLoading ? 'Entrando...' : 'Entrar'}
    </button>
  );
};
