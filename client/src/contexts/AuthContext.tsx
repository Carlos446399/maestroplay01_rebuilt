import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
  const gsiReady = useRef(false);

  // Carregar Google Identity Services script
  useEffect(() => {
    if (document.getElementById('google-gsi')) return;
    const s = document.createElement('script');
    s.id = 'google-gsi';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => { gsiReady.current = true; };
    document.head.appendChild(s);
  }, []);

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

  const signIn = useCallback(() => {
    setIsLoading(true);
    const attempt = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) {
        setTimeout(attempt, 500);
        return;
      }
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r: any) => handleToken(r.credential),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      g.accounts.id.prompt((n: any) => {
        if (n.isNotDisplayed() || n.isSkippedMoment()) {
          // Fallback: usar OAuth popup
          const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: `${window.location.origin}/auth/callback`,
            response_type: 'token',
            scope: 'openid profile email',
            prompt: 'select_account',
          });
          // Usa o One Tap via link direto
          const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
          const popup = window.open(url, 'google-auth', 'width=500,height=600');
          
          // Ouvir mensagem de callback
          const handler = (e: MessageEvent) => {
            if (e.origin !== window.location.origin) return;
            if (e.data?.type === 'google-auth' && e.data.credential) {
              handleToken(e.data.credential);
              window.removeEventListener('message', handler);
              popup?.close();
            }
          };
          window.addEventListener('message', handler);
          setIsLoading(false);
        }
      });
    };
    attempt();
  }, [handleToken]);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    try { (window as any).google?.accounts?.id?.disableAutoSelect(); } catch {}
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
