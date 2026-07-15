import { useState, useRef } from 'react';
import { Crown, X, Camera, LogOut, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  getProfile,
  hasProfile,
  createProfile,
  login,
  isLoggedIn,
  logout,
  updateUsername,
  updatePhoto,
  resizeImageFile,
} from '@/services/profileService';

type ModalMode = 'closed' | 'auth' | 'profile';

/**
 * Botão flutuante de perfil. Mostra a coroa dourada enquanto não há foto
 * definida; depois de definida, mostra a foto no lugar da coroa.
 *
 * Fluxo: sem conta local -> formulário de criar conta (usuário + senha).
 * Com conta mas não "logado" nesta sessão -> formulário de entrar.
 * Logado -> painel de perfil (trocar foto, editar nome).
 *
 * IMPORTANTE: isso é uma trava local simples, guardada só neste
 * aparelho — não é uma conta real sincronizada com servidor.
 */
interface ProfileButtonProps {
  /** Abre o painel de estatísticas de escuta (agora acessível só por aqui) */
  onOpenStats?: () => void;
}

export const ProfileButton = ({ onOpenStats }: ProfileButtonProps) => {
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [, setProfileVersion] = useState(0); // força re-render após mudanças
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = getProfile();
  const bump = () => setProfileVersion(v => v + 1);

  const handleButtonClick = () => {
    if (!hasProfile()) {
      setModalMode('auth');
    } else if (!isLoggedIn()) {
      setModalMode('auth');
    } else {
      setModalMode('profile');
    }
  };

  const handleAuthSubmit = () => {
    const username = authUsername.trim();
    if (!username || !authPassword) {
      toast.error('Preencha usuário e senha.');
      return;
    }

    if (!hasProfile()) {
      if (authPassword !== authPasswordConfirm) {
        toast.error('As senhas não são iguais. Confirme novamente.');
        return;
      }
      createProfile(username, authPassword);
      toast.success('Conta criada neste aparelho!');
    } else {
      const ok = login(username, authPassword);
      if (!ok) {
        toast.error('Usuário ou senha incorretos.');
        return;
      }
      toast.success('Bem-vindo de volta!');
    }
    setAuthUsername('');
    setAuthPassword('');
    setAuthPasswordConfirm('');
    setModalMode('profile');
    bump();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file);
      updatePhoto(dataUrl);
      bump();
      toast.success('Foto atualizada!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao processar a foto.');
    }
    e.target.value = '';
  };

  const handleUsernameEdit = (newName: string) => {
    if (!newName.trim()) return;
    updateUsername(newName.trim());
    bump();
  };

  const handleLogout = () => {
    logout();
    setModalMode('closed');
    bump();
    toast.info('Você saiu do perfil neste aparelho.');
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="fixed top-20 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm border border-gray-700 hover:border-gray-500 transition-all duration-300 overflow-hidden"
        title="Perfil"
      >
        {profile?.photoDataUrl ? (
          <img src={profile.photoDataUrl} alt="Perfil" className="w-full h-full object-cover" />
        ) : (
          <Crown size={20} className="text-amber-400" />
        )}
      </button>

      {/* Modal sempre montado, só escondido via CSS (evita o crash de
          removeChild que já tivemos em outros modais deste app) */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity ${
          modalMode !== 'closed' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setModalMode('closed')}
      >
        <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
          {modalMode === 'auth' && (
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-black text-gray-800">
                  {hasProfile() ? 'Entrar no perfil' : 'Criar conta local'}
                </h2>
                <button onClick={() => setModalMode('closed')} className="text-gray-400"><X size={20} /></button>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">
                Guardado só neste aparelho — não é sincronizado com nenhum servidor.
              </p>
              {!hasProfile() && (
                <p className="text-[10px] text-gray-400 mb-3 -mt-2">
                  Ao criar uma conta, você concorda com os{' '}
                  <a href="/terms-of-service.html" target="_blank" rel="noopener" className="underline text-purple-500">
                    Termos de Serviço
                  </a>{' '}
                  e a{' '}
                  <a href="/privacy-policy.html" target="_blank" rel="noopener" className="underline text-purple-500">
                    Política de Privacidade
                  </a>.
                </p>
              )}
              <label className="text-[11px] font-semibold text-gray-500">Nome de usuário</label>
              <input
                type="text"
                placeholder="Como você quer ser chamado"
                value={authUsername}
                onChange={e => setAuthUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 mb-3 mt-1 focus:outline-none focus:border-purple-400"
              />
              <label className="text-[11px] font-semibold text-gray-500">Senha</label>
              <input
                type="password"
                placeholder="Sua senha"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                className={cn(
                  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 mt-1 focus:outline-none focus:border-purple-400",
                  hasProfile() ? "mb-4" : "mb-3"
                )}
              />
              {!hasProfile() && (
                <>
                  <label className="text-[11px] font-semibold text-gray-500">Confirmar senha</label>
                  <input
                    type="password"
                    placeholder="Digite a senha de novo"
                    value={authPasswordConfirm}
                    onChange={e => setAuthPasswordConfirm(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 mb-4 mt-1 focus:outline-none focus:border-purple-400"
                  />
                </>
              )}
              <button
                onClick={handleAuthSubmit}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
              >
                {hasProfile() ? 'Entrar' : 'Criar conta'}
              </button>
            </>
          )}

          {modalMode === 'profile' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-gray-800">Meu perfil</h2>
                <button onClick={() => setModalMode('closed')} className="text-gray-400"><X size={20} /></button>
              </div>

              <div className="flex flex-col items-center mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-purple-200 mb-2"
                >
                  {profile?.photoDataUrl ? (
                    <img src={profile.photoDataUrl} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <Crown size={28} className="text-amber-400" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera size={18} className="text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <span className="text-[10px] text-gray-400">Toque na foto para trocar</span>
              </div>

              <label className="text-[11px] font-semibold text-gray-500">Nome de usuário</label>
              <input
                type="text"
                defaultValue={profile?.username}
                key={profile?.username}
                onBlur={e => handleUsernameEdit(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 mb-4 mt-1 focus:outline-none focus:border-purple-400"
              />

              <button
                onClick={() => { onOpenStats?.(); setModalMode('closed'); }}
                className="w-full flex items-center justify-center gap-2 text-purple-600 text-sm font-semibold py-2 rounded-lg hover:bg-purple-50 transition-colors mb-2"
              >
                <BarChart2 size={14} /> Estatísticas de escuta
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-red-500 text-sm font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Sair do perfil
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
