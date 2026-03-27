import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('[AppErrorBoundary]', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-dark-base px-4">
          <div className="max-w-md w-full rounded-lg border border-border-subtle bg-dark-secondary p-6 text-center">
            <h2 className="text-h4 font-heading text-text-primary">Terjadi gangguan halaman</h2>
            <p className="text-body-sm text-text-secondary mt-2">
              Coba muat ulang halaman untuk melanjutkan.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-all duration-fast"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
