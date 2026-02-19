// src/components/common/UI.js
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

// ── Animations ──────────────────────────────────────────────────────────────
const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.2); }
  50% { box-shadow: 0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.1); }
`;
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ── Card ────────────────────────────────────────────────────────────────────
export const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ p }) => p || '24px'};
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(59,130,246,0.03) 0%, transparent 60%);
    pointer-events: none;
  }

  ${({ hoverable }) => hoverable && css`
    cursor: pointer;
    &:hover {
      border-color: ${({ theme }) => theme.colors.borderHover};
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(59,130,246,0.15);
    }
  `}

  ${({ glow }) => glow && css`
    animation: ${glowPulse} 3s ease-in-out infinite;
  `}
`;

// ── Glass Card ───────────────────────────────────────────────────────────────
export const GlassCard = styled(Card)`
  background: rgba(15, 21, 38, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
`;

// ── Button ──────────────────────────────────────────────────────────────────
const buttonVariants = {
  primary: css`
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #fff;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35);
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
      box-shadow: 0 6px 28px rgba(59,130,246,0.5);
      transform: translateY(-1px);
    }
  `,
  accent: css`
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    color: #fff;
    box-shadow: 0 4px 20px rgba(6,182,212,0.35);
    &:hover:not(:disabled) {
      box-shadow: 0 6px 28px rgba(6,182,212,0.5);
      transform: translateY(-1px);
    }
  `,
  success: css`
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    box-shadow: 0 4px 20px rgba(16,185,129,0.3);
    &:hover:not(:disabled) {
      box-shadow: 0 6px 28px rgba(16,185,129,0.45);
      transform: translateY(-1px);
    }
  `,
  danger: css`
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #fff;
    box-shadow: 0 4px 20px rgba(239,68,68,0.3);
    &:hover:not(:disabled) {
      box-shadow: 0 6px 28px rgba(239,68,68,0.45);
      transform: translateY(-1px);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
      background: rgba(59,130,246,0.06);
    }
  `,
  warning: css`
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #fff;
    box-shadow: 0 4px 20px rgba(245,158,11,0.3);
    &:hover:not(:disabled) {
      box-shadow: 0 6px 28px rgba(245,158,11,0.45);
      transform: translateY(-1px);
    }
  `,
};

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({ size }) => size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 32px' : '11px 22px'};
  font-size: ${({ size }) => size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px'};
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.body};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 0.25s ease;
  cursor: pointer;
  white-space: nowrap;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};

  ${({ variant = 'primary', theme }) => buttonVariants[variant]}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
  }

  &:active:not(:disabled) { transform: translateY(0) scale(0.98); }
`;

// ── Input ───────────────────────────────────────────────────────────────────
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const Input = styled.input`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 11px 14px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }

  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

export const Select = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 11px 14px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border-color 0.2s;
  width: 100%;
  outline: none;
  cursor: pointer;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
  option { background: ${({ theme }) => theme.colors.bgCard}; }
`;

// ── Badge ────────────────────────────────────────────────────────────────────
const badgeColors = {
  active: css`background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.3);`,
  cancelled: css`background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3);`,
  expired: css`background: rgba(71,85,105,0.3); color: #64748b; border-color: rgba(71,85,105,0.3);`,
  completed: css`background: rgba(59,130,246,0.15); color: #3b82f6; border-color: rgba(59,130,246,0.3);`,
  waiting: css`background: rgba(245,158,11,0.15); color: #f59e0b; border-color: rgba(245,158,11,0.3);`,
  notified: css`background: rgba(6,182,212,0.15); color: #06b6d4; border-color: rgba(6,182,212,0.3);`,
  manager: css`background: rgba(168,85,247,0.15); color: #a855f7; border-color: rgba(168,85,247,0.3);`,
  general: css`background: rgba(59,130,246,0.15); color: #3b82f6; border-color: rgba(59,130,246,0.3);`,
  available: css`background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.3);`,
  booked: css`background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3);`,
  employee: css`background: rgba(59,130,246,0.15); color: #3b82f6; border-color: rgba(59,130,246,0.3);`,
  admin: css`background: rgba(168,85,247,0.15); color: #a855f7; border-color: rgba(168,85,247,0.3);`,
};

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid transparent;
  ${({ status = 'general' }) => badgeColors[status] || badgeColors.general}
`;

// ── Text ─────────────────────────────────────────────────────────────────────
export const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ size }) => size || '2rem'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.02em;
  line-height: 1.2;

  ${({ gradient }) => gradient && css`
    background: linear-gradient(135deg, #f0f6ff 0%, #3b82f6 50%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

export const Text = styled.p`
  color: ${({ theme, muted }) => muted ? theme.colors.textSecondary : theme.colors.textPrimary};
  font-size: ${({ size }) => size || '14px'};
  line-height: 1.6;
`;

// ── Divider ──────────────────────────────────────────────────────────────────
export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ my }) => my || '16px'} 0;
`;

// ── Flex / Grid helpers ───────────────────────────────────────────────────────
export const Flex = styled.div`
  display: flex;
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  gap: ${({ gap }) => gap || '0'};
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
  flex-direction: ${({ direction }) => direction || 'row'};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || 'repeat(auto-fill, minmax(280px, 1fr))'};
  gap: ${({ gap }) => gap || '20px'};
`;

// ── Spinner ──────────────────────────────────────────────────────────────────
const spinAnim = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
export const Spinner = styled.div`
  width: ${({ size }) => size || '24px'};
  height: ${({ size }) => size || '24px'};
  border: 2px solid rgba(59,130,246,0.2);
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spinAnim} 0.7s linear infinite;
  flex-shrink: 0;
`;

// ── Stat Box ─────────────────────────────────────────────────────────────────
export const StatCard = styled(Card)`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${({ theme }) => theme.colors.textMuted};
  }
  .stat-value {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 2.2rem;
    font-weight: 700;
    color: ${({ color, theme }) => color || theme.colors.primary};
    line-height: 1;
  }
  .stat-sub {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textMuted};

  .icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.4; }
  .title { font-size: 18px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 8px; }
  .desc { font-size: 14px; }
`;

// ── Page Wrapper ──────────────────────────────────────────────────────────────
export const PageWrapper = styled(motion.div)`
  padding: 28px 32px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 20px 16px; }
`;

export const PageHeader = styled.div`
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

// ── Section Title ────────────────────────────────────────────────────────────
export const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

// ── Loading Page ─────────────────────────────────────────────────────────────
export const LoadingPage = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
    <Spinner size="48px" />
    <Text muted size="14px">Loading K-Park...</Text>
  </div>
);
