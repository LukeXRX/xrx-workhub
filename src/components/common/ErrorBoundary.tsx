"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
            <div className="text-5xl mb-4">&#9888;&#65039;</div>
            <h2 className="text-xl font-semibold text-tx mb-2">
              문제가 발생했습니다
            </h2>
            <p className="text-[14px] text-tx-3 mb-6 max-w-md">
              {this.state.error?.message || "알 수 없는 오류가 발생했습니다."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 bg-accent text-black text-[14px] font-bold rounded hover:brightness-110 transition-all"
            >
              다시 시도
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
