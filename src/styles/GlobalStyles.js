// src/styles/GlobalStyles.js
import { createGlobalStyle, keyframes } from 'styled-components';

const gridMove = keyframes`0% { transform: translateY(0); } 100% { transform: translateY(50px); }`;
const spinSlow = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const shimmer = keyframes`0% { background-position: -200% center; } 100% { background-position: 200% center; }`;
const pulseRing = keyframes`0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); } 100% { box-shadow: 0 0 0 12px rgba(59,130,246,0); }`;

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html {
    -webkit-text-size-adjust: 100%;
    /* prevent horizontal scroll on mobile */
    overflow-x: hidden;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.textPrimary};
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* safe area for notched phones */
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Animated grid background */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: ${gridMove} 6s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  #root { position: relative; z-index: 1; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.25); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.45); }

  /* Remove tap highlight on iOS */
  a, button, input, select, textarea { -webkit-tap-highlight-color: transparent; }

  /* Prevent text selection on buttons */
  button { user-select: none; }

  a { text-decoration: none; color: inherit; }

  /* Smooth scrolling */
  html { scroll-behavior: smooth; }

  /* Input/select reset for iOS */
  input[type="date"],
  input[type="time"],
  input[type="datetime-local"] {
    -webkit-appearance: none;
    appearance: none;
  }

  /* Keyframe exports */
  @keyframes spin-slow { ${spinSlow.rules || 'from{transform:rotate(0deg)}to{transform:rotate(360deg)}'} }
  @keyframes shimmer { ${shimmer.rules || '0%{background-position:-200% center}100%{background-position:200% center}'} }
  @keyframes pulse-ring { ${pulseRing.rules || '0%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)}100%{box-shadow:0 0 0 12px rgba(59,130,246,0)}'} }

  /* Mobile viewport height fix */
  .full-height { min-height: 100vh; min-height: -webkit-fill-available; }

  /* Focus visible for accessibility */
  :focus-visible {
    outline: 2px solid rgba(59,130,246,0.6);
    outline-offset: 2px;
    border-radius: 4px;
  }
  :focus:not(:focus-visible) { outline: none; }

  /* Prevent layout shift from scrollbar */
  html { scrollbar-gutter: stable; }

  @media (max-width: 900px) {
    /* Push content down on mobile (hamburger menu is fixed top-left) */
    #root > div > main {
      padding-top: 56px;
    }
  }
`;