/**
 * AuthContext - Gerencia autenticação com Google OAuth 2.0
 * Usa Google Identity Services (GIS) — funciona 100% no frontend
 * sem necessidade de backend.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Client ID do Google OAuth — criado no Google Cloud Console
// Projeto: 537890558416 (mesmo do YouTube e Drive)
// Para criar: console.cloud.google.com → APIs → Credenciais → Criar credencial → ID do cliente OAuth 2.0
// Tipo: Aplicativo da Web
// Origens JS autorizadas: https://maestroxpp.netlify.app
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken?: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'maestroplay_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const isConfigured = !!GOOGLE_CLIENT_ID;

  // Carregar o script do Google Identity Services
  useEffect(() => {
    if (!isConfigured) return;

    const existingScript = document.getElementById('google-gsi');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => { (window as any).googleAccounts = (window as any).google; };
    script.id = 'google-gsi';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [isConfigured]);

  const handleCredentialResponse = useCallback((response: any) => {
    try {
      // Decodificar o JWT token do Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const googleUser: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(googleUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(googleUser));
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao processar login:', err);
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(() => {
    if (!isConfigured) {
      alert('Login com Google não configurado. Adicione o VITE_GOOGLE_CLIENT_ID nas variáveis de ambiente do Netlify.');
      return;
    }

    setIsLoading(true);

    // Inicializar o Google Identity Services
    if (window.googleAccounts?.accounts?.id) {
      window.googleAccounts!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });
      window.googleAccounts!.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: abrir popup de login
          window.googleAccounts!.accounts.id.renderButton(
            document.getElementById('google-signin-btn')!,
            { theme: 'outline', size: 'large' }
          );
          setIsLoading(false);
        }
      });
    } else {
      // Script ainda não carregou — tenta de novo em 1s
      setTimeout(() => signIn(), 1000);
    }
  }, [isConfigured, handleCredentialResponse]);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    if (window.googleAccounts?.accounts?.id) {
      window.googleAccounts!.accounts.id.disableAutoSelect();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isConfigured, signIn, signOut }}>
      {children}
      {/* Botão oculto usado como fallback pelo GIS */}
      <div id="google-signin-btn" className="hidden" />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Tipo global para o Google Identity Services
declare global {
  interface Window {
    googleAccounts?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
