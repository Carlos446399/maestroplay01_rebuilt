import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Erros de DOM como "insertBefore"/"removeChild" costumam ser falhas
// transitórias de sincronização entre o React e o navegador (não
// corrupção real de dados) — geralmente uma nova renderização limpa
// resolve sozinha. Por isso tentamos nos recuperar automaticamente antes
// de mostrar a tela de erro, evitando travar o app à toa.
const isTransientDomError = (error: Error): boolean => {
  const msg = error.message || '';
  return /insertBefore|removeChild|is not a child of this node/i.test(msg);
};

const MAX_AUTO_RETRIES = 3;

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (isTransientDomError(error) && this.retryCount < MAX_AUTO_RETRIES) {
      this.retryCount++;
      // Pequeno atraso para deixar o navegador terminar qualquer
      // manipulação de DOM pendente antes do React tentar de novo.
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 150);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
  }

  render() {
    if (this.state.hasError) {
      const isTransient = this.state.error && isTransientDomError(this.state.error);
      const stillRetrying = isTransient && this.retryCount < MAX_AUTO_RETRIES;

      // Enquanto a recuperação automática ainda está em andamento (o
      // setTimeout do componentDidCatch vai resetar o estado em breve),
      // mostra uma tela neutra em vez da árvore quebrada ou do erro —
      // dura só ~150ms, imperceptível na maioria dos casos.
      if (stillRetrying) {
        return <div className="min-h-screen bg-background" />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
