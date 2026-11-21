'use client';

import React from 'react';

type Props = { children: React.ReactNode; onReturnHome: () => void; title: string; message: string; action: string };
type State = { hasError: boolean };

export class SectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('A page section failed to render', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
          <h2 className="text-lg font-black">{this.props.title}</h2>
          <p className="mt-2 text-sm">{this.props.message}</p>
          <button
            type="button"
            onClick={() => { this.setState({ hasError: false }); this.props.onReturnHome(); }}
            className="mt-4 min-h-[44px] rounded-xl bg-rose-800 px-4 py-2 text-sm font-bold text-white"
          >
            {this.props.action}
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
