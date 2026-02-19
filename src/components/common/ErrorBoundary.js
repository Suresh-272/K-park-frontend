// src/components/common/ErrorBoundary.js
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('🔴 Page crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: '40px 20px',
          textAlign: 'center', color: '#94a3b8',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#f0f6ff', fontFamily: 'Orbitron, sans-serif', fontSize: 18, marginBottom: 10 }}>
            Page Error
          </h2>
          <p style={{ fontSize: 14, maxWidth: 360, marginBottom: 24 }}>
            Something went wrong loading this page. This is usually caused by unexpected data from the server.
          </p>
          <p style={{ fontSize: 12, color: '#475569', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: 8, maxWidth: 400, wordBreak: 'break-word' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              marginTop: 24, padding: '10px 24px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>
            🔄 Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}