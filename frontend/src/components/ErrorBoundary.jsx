import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "An unexpected UI error occurred.",
    };
  }

  componentDidCatch(error) {
    console.error("UI crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="glass-panel max-w-xl p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
              Something Went Wrong
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
              The page crashed instead of showing your data.
            </h1>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {this.state.message}
            </p>
            <button
              className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white dark:bg-brand-500 dark:text-slate-950"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
