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
  showLoginButton: boolean;
  setShowLoginButton: (v: boolean) => void;
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
  const [showLoginButton, setShowLoginButton] = useState(false);
  const initialized = useRef(false);

  const handleCredential = useCallback((response: { credential: string }) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const u: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(u);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
      setShowLoginButton(false);
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicializar Google Identity Services
  useEffect(() => {
    if (initialized.current) return;

    const init = () => {
      if (!(window as any).google?.accounts?.id) return;
      initialized.current = true;
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false,
      });
    };

    // Se já carregou
    if ((window as any).google?.accounts?.id) {
      init();
      return;
    }

    // Carregar script
    const existing = document.getElementById('google-gsi');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(checkInterval);
          init();
        }
      }, 200);
      return () => clearInterval(checkInterval);
    }
  }, [handleCredential]);

  // Renderizar botão do Google quando showLoginButton=true
  useEffect(() => {
    if (!showLoginButton || user) return;

    const tryRender = () => {
      const el = document.getElementById('google-signin-container');
      if (!el || !(window as any).google?.accounts?.id) return false;
      (window as any).google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        locale: 'pt-BR',
      });
      return true;
    };

    if (!tryRender()) {
      const t = setTimeout(tryRender, 500);
      return () => clearTimeout(t);
    }
  }, [showLoginButton, user]);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    try { (window as any).google?.accounts?.id?.disableAutoSelect(); } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, showLoginButton, setShowLoginButton, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
