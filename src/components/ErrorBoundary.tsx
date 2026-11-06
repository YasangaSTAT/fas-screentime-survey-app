import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-slate-900/90 p-6 text-center backdrop-blur-xl shadow-2xl space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Application Notice</h2>
              <p className="text-xs text-slate-400 mt-1">
                STA 330 2.0 Smartphone Screen Time Study
              </p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32 border border-slate-800">
              {this.state.error?.message || 'An unexpected rendering issue occurred.'}
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch {}
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Cache &amp; Reload</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
