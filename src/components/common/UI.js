// src/components/common/UI.js
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.2); }
  50% { box-shadow: 0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.1); }
`;
const spinAnim = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

// ── Card ─────────────────────────────────────────────────────────────────────
export const Card = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['hoverable','glow','p'].includes(prop),
})`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ p }) => p || '20px'};
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
    &:hover { border-color: ${({ theme }) => theme.colors.borderHover}; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(59,130,246,0.15); }
    &:active { transform: scale(0.99); }
  `}

  ${({ glow }) => glow && css`animation: ${glowPulse} 3s ease-in-out infinite;`}

  @media (max-width: 480px) { border-radius: 12px; }
`;

export const GlassCard = styled(Card)`
  background: rgba(15, 21, 38, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
`;

// ── Button ───────────────────────────────────────────────────────────────────
const buttonVariants = {
  primary: css`
    background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff;
    box-shadow: 0 4px 20px rgba(59,130,246,0.35);
    &:hover:not(:disabled) { background: linear-gradient(135deg, #60a5fa, #3b82f6); box-shadow: 0 6px 28px rgba(59,130,246,0.5); transform: translateY(-1px); }
  `,
  accent: css`
    background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff;
    box-shadow: 0 4px 20px rgba(6,182,212,0.35);
    &:hover:not(:disabled) { box-shadow: 0 6px 28px rgba(6,182,212,0.5); transform: translateY(-1px); }
  `,
  success: css`
    background: linear-gradient(135deg, #10b981, #059669); color: #fff;
    box-shadow: 0 4px 20px rgba(16,185,129,0.3);
    &:hover:not(:disabled) { box-shadow: 0 6px 28px rgba(16,185,129,0.45); transform: translateY(-1px); }
  `,
  danger: css`
    background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
    box-shadow: 0 4px 20px rgba(239,68,68,0.3);
    &:hover:not(:disabled) { box-shadow: 0 6px 28px rgba(239,68,68,0.45); transform: translateY(-1px); }
  `,
  ghost: css`
    background: transparent; color: ${({ theme }) => theme.colors.textSecondary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; background: rgba(59,130,246,0.06); }
  `,
  warning: css`
    background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;
    box-shadow: 0 4px 20px rgba(245,158,11,0.3);
    &:hover:not(:disabled) { box-shadow: 0 6px 28px rgba(245,158,11,0.45); transform: translateY(-1px); }
  `,
};

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant','size','fullWidth'].includes(prop),
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${({ size }) => size === 'sm' ? '9px 16px' : size === 'lg' ? '14px 28px' : '11px 20px'};
  font-size: ${({ size }) => size === 'sm' ? '13px' : size === 'lg' ? '15px' : '14px'};
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.body};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 0.25s ease;
  cursor: pointer;
  white-space: nowrap;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  min-height: 44px; /* touch target */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  ${({ variant = 'primary', theme }) => buttonVariants[variant]}

  &:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
  &:active:not(:disabled) { transform: scale(0.97) !important; }

  @media (max-width: 480px) {
    padding: ${({ size }) => size === 'sm' ? '9px 14px' : size === 'lg' ? '13px 22px' : '11px 18px'};
    font-size: ${({ size }) => size === 'sm' ? '13px' : '14px'};
  }
`;

// ── Inputs ───────────────────────────────────────────────────────────────────
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
  padding: 12px 14px;
  font-size: 16px; /* 16px prevents iOS zoom */
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  outline: none;
  min-height: 48px;
  -webkit-appearance: none;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

export const Select = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 12px 14px;
  font-size: 16px; /* prevents iOS zoom */
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border-color 0.2s;
  width: 100%;
  outline: none;
  cursor: pointer;
  min-height: 48px;
  -webkit-appearance: none;

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
  inactive: css`background: rgba(71,85,105,0.2); color: #64748b; border-color: rgba(71,85,105,0.3);`,
};

export const Badge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'status',
})`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid transparent;
  flex-shrink: 0;
  ${({ status = 'general' }) => badgeColors[status] || badgeColors.general}
`;

// ── Text ─────────────────────────────────────────────────────────────────────
export const Title = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['size','gradient'].includes(prop),
})`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ size }) => size || '2rem'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.02em;
  line-height: 1.2;

  ${({ gradient }) => gradient && css`
    background: linear-gradient(135deg, #f0f6ff 0%, #3b82f6 50%, #06b6d4 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  `}

  @media (max-width: 480px) {
    font-size: ${({ size }) => {
      if (!size) return '1.5rem';
      const num = parseFloat(size);
      return `${Math.max(num * 0.82, 1.0)}rem`;
    }};
  }
`;

export const Text = styled.p.withConfig({
  shouldForwardProp: (prop) => !['muted','size'].includes(prop),
})`
  color: ${({ theme, muted }) => muted ? theme.colors.textSecondary : theme.colors.textPrimary};
  font-size: ${({ size }) => size || '14px'};
  line-height: 1.6;
`;

// ── Layout helpers ───────────────────────────────────────────────────────────
export const Divider = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'my',
})`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ my }) => my || '16px'} 0;
`;

export const Flex = styled.div.withConfig({
  shouldForwardProp: (prop) => !['align','justify','gap','wrap','direction'].includes(prop),
})`
  display: flex;
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  gap: ${({ gap }) => gap || '0'};
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
  flex-direction: ${({ direction }) => direction || 'row'};
`;

export const Grid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cols','gap','mobileCols','mobileGap'].includes(prop),
})`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || 'repeat(auto-fill, minmax(280px, 1fr))'};
  gap: ${({ gap }) => gap || '16px'};

  @media (max-width: 480px) {
    grid-template-columns: ${({ mobileCols }) => mobileCols || '1fr 1fr'};
    gap: ${({ mobileGap }) => mobileGap || '10px'};
  }
`;

// ── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'size',
})`
  width: ${({ size }) => size || '24px'};
  height: ${({ size }) => size || '24px'};
  border: 2px solid rgba(59,130,246,0.2);
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spinAnim} 0.7s linear infinite;
  flex-shrink: 0;
`;

// ── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = styled(Card).withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .stat-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${({ theme }) => theme.colors.textMuted};
  }
  .stat-value {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.9rem;
    font-weight: 700;
    color: ${({ color, theme }) => color || theme.colors.primary};
    line-height: 1;
  }
  .stat-sub { font-size: 11px; color: ${({ theme }) => theme.colors.textSecondary}; }

  @media (max-width: 480px) {
    padding: 14px;
    .stat-value { font-size: 1.5rem; }
    .stat-label { font-size: 9px; }
  }
`;

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: ${({ theme }) => theme.colors.textMuted};

  .icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; }
  .title { font-size: 16px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 6px; }
  .desc { font-size: 13px; }

  @media (max-width: 480px) { padding: 36px 16px; }
`;

// ── Page Wrapper ─────────────────────────────────────────────────────────────
export const PageWrapper = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['padding'].includes(prop),
})`
  padding: 24px 28px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 18px 16px; }
  @media (max-width: 480px) {
    padding: 14px 12px;
    /* bottom padding for mobile bottom nav */
    padding-bottom: 90px;
  }
`;

export const PageHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    margin-bottom: 18px;
    align-items: center;
  }
`;

// ── Section Title ─────────────────────────────────────────────────────────────
export const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::after { content: ''; flex: 1; height: 1px; background: ${({ theme }) => theme.colors.border}; }
`;

// ── Modal helpers ─────────────────────────────────────────────────────────────
export const ModalBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;

  @media (max-width: 480px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalSheet = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'maxWidth',
})`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth || '460px'};
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;

  @media (max-width: 480px) {
    border-radius: 20px 20px 0 0;
    max-width: 100%;
    max-height: 92vh;
    padding: 20px 16px 32px;
    /* handle bar */
    &::before {
      content: '';
      display: block;
      width: 40px;
      height: 4px;
      background: rgba(99,179,237,0.2);
      border-radius: 99px;
      margin: 0 auto 18px;
    }
  }
`;

// ── Loading Page ──────────────────────────────────────────────────────────────
export const LoadingPage = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
    <Spinner size="44px" />
    <Text muted size="14px">Loading K-Park...</Text>
  </div>
);