import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const GOOGLE_CLIENT_ID = '537890558416-b2paavkc8r5rgov1t0idseh1s3vit25j.apps.googleusercontent.com';
const USER_STORAGE_KEY = 'maestroplay_user';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const s = localStorage.getItem(USER_STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToken = useCallback((credential: string) => {
    try {
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const u: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(u);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    } catch (e) {
      console.error('Erro no login:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Escuta mensagem de retorno do popup OAuth
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'google-auth-token' && e.data.id_token) {
        handleToken(e.data.id_token);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [handleToken]);

  const signIn = useCallback(() => {
    setIsLoading(true);
    // Abre popup OAuth puro — sem Google One Tap (que causa insertBefore)
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}`,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce: Math.random().toString(36),
      prompt: 'select_account',
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    const w = 480, h = 600;
    const left = (screen.width - w) / 2;
    const top = (screen.height - h) / 2;
    const popup = window.open(url, 'google-login', `width=${w},height=${h},left=${left},top=${top}`);

    // Verificar quando o popup fecha e extrair o token do hash
    const timer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setIsLoading(false);
          return;
        }
        const hash = popup.location.hash;
        if (hash && hash.includes('id_token')) {
          const params = new URLSearchParams(hash.substring(1));
          const idToken = params.get('id_token');
          if (idToken) {
            handleToken(idToken);
            popup.close();
            clearInterval(timer);
          }
        }
      } catch {
        // Cross-origin — ainda carregando
      }
    }, 300);
  }, [handleToken]);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
