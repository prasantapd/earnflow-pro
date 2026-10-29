import React from 'react';
import { AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      localStorage.removeItem('taskcoin_app_state');
      localStorage.removeItem('earnflow_app_state');
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{ 
            minHeight: '60vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem 1rem' 
          }}
        >
          <div 
            className="glass-card" 
            style={{ 
              maxWidth: 540, 
              width: '100%', 
              padding: '2rem', 
              textAlign: 'center',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)'
            }}
          >
            <div 
              style={{ 
                width: 56, 
                height: 56, 
                borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#f87171',
                margin: '0 auto 1.25rem' 
              }}
            >
              <AlertCircle size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Something went wrong
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              একটি ত্রুটি ঘটেছে। আপনার অ্যাকাউন্ট এবং ফান্ড সম্পূর্ণ সুরক্ষিত আছে। পেজটি রিলোড করতে নিচের বাটনে চাপ দিন।
            </p>

            {this.state.error && (
              <div 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.35)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px', 
                  fontSize: '0.75rem', 
                  color: '#fca5a5', 
                  textAlign: 'left', 
                  fontFamily: 'monospace',
                  marginBottom: '1.5rem',
                  overflowX: 'auto',
                  maxHeight: 120
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={this.handleReload}
                style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={15} /> Reload Application
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={this.handleResetState}
                style={{ fontSize: '0.85rem' }}
              >
                <RotateCcw size={15} /> Clear & Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
