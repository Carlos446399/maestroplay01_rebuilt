import { useState } from 'react';
import { LogOut, User, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const ProfileButton = () => {
  const { user, showLoginButton, setShowLoginButton, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (user) {
    return (
      <>
        <button
          onClick={() => setShowMenu(true)}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500 flex-shrink-0"
        >
          <img src={user.picture} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </button>

        {showMenu && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowMenu(false)}>
            <div className="w-full bg-white rounded-t-2xl p-5 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-purple-500" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>
                <button onClick={() => setShowMenu(false)} className="text-gray-400"><X size={20} /></button>
              </div>
              <div className="h-px bg-gray-100 mb-4" />
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-50 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <User size={16} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">Conta Google</p>
                  <p className="text-[10px] text-gray-500">Conectado</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <button
                onClick={() => { signOut(); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600"
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
    <>
      <button
        onClick={() => setShowLoginButton(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Entrar
      </button>

      {/* Modal de login com botão real do Google */}
      {showLoginButton && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowLoginButton(false)}>
          <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-gray-800">Entrar no MaestroPlay</h2>
              <button onClick={() => setShowLoginButton(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-5">Faça login com sua conta Google para salvar suas preferências.</p>

            {/* Container onde o Google renderiza o botão oficial */}
            <div className="flex justify-center mb-4">
              <div id="google-signin-container" />
            </div>

            <p className="text-[10px] text-gray-400 text-center">
              Ao continuar, você concorda com os termos de uso do MaestroPlay.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
