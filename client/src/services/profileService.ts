/**
 * profileService - Perfil local do usuário (nome + foto), guardado só
 * neste aparelho via localStorage. IMPORTANTE: isso NÃO é uma conta real
 * sincronizada com servidor — não existe backend/banco de dados no app.
 * A senha serve apenas como uma trava local simples, não é criptografada
 * nem seguramente armazenada. Serve para dar a sensação de "criar conta"
 * localmente, não para proteger dados sensíveis de verdade.
 */

export interface ProfileData {
  username: string;
  password: string;
  photoDataUrl?: string;
}

const PROFILE_KEY = 'maestroplay_profile';
const SESSION_LOGIN_KEY = 'maestroplay_profile_logged_in';

export const getProfile = (): ProfileData | null => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const hasProfile = (): boolean => getProfile() !== null;

export const createProfile = (username: string, password: string): ProfileData => {
  const data: ProfileData = { username, password };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  markLoggedIn();
  return data;
};

export const login = (username: string, password: string): boolean => {
  const profile = getProfile();
  if (!profile) return false;
  const ok = profile.username === username && profile.password === password;
  if (ok) markLoggedIn();
  return ok;
};

export const markLoggedIn = () => {
  sessionStorage.setItem(SESSION_LOGIN_KEY, '1');
};

export const isLoggedIn = (): boolean => {
  return sessionStorage.getItem(SESSION_LOGIN_KEY) === '1';
};

export const logout = () => {
  sessionStorage.removeItem(SESSION_LOGIN_KEY);
};

export const updateUsername = (username: string) => {
  const profile = getProfile();
  if (!profile) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, username }));
};

export const updatePhoto = (photoDataUrl: string) => {
  const profile = getProfile();
  if (!profile) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, photoDataUrl }));
};

/** Redimensiona uma imagem para no máximo 256x256 antes de guardar (evita estourar o localStorage) */
export const resizeImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo não é uma imagem válida'));
      img.onload = () => {
        const MAX = 256;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height *= MAX / width; width = MAX; }
        } else {
          if (height > MAX) { width *= MAX / height; height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Erro ao processar imagem'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};
