// src/pages/admin/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdAdminPanelSettings, MdArrowBack, MdShield } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, InputGroup, Label, Spinner } from '../../components/common/UI';

const gridMove = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
`;
const scanLine = keyframes`
  0% { top: -10%; }
  100% { top: 110%; }
`;
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;
const hexFloat = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.06; }
  50% { transform: translateY(-30px) rotate(60deg); opacity: 0.12; }
`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  background: #050810;
  overflow: hidden;
  position: relative;
`;

const GridBg = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: ${gridMove} 4s linear infinite;
  pointer-events: none;
`;

const ScanLine = styled.div`
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
  animation: ${scanLine} 6s linear infinite;
  pointer-events: none;
  z-index: 1;
`;

const HexShape = styled.div`
  position: absolute;
  font-size: ${({ size }) => size || '80px'};
  animation: ${hexFloat} ${({ dur }) => dur || '6s'} ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || '0s'};
  user-select: none;
  pointer-events: none;
`;

// Left panel — branding
const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  border-right: 1px solid rgba(59,130,246,0.1);

  @media (max-width: 900px) { display: none; }
`;

const ShieldOrb = styled(motion.div)`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, rgba(59,130,246,0.25), rgba(6,182,212,0.08));
  border: 1px solid rgba(59,130,246,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  margin-bottom: 36px;
  box-shadow: 0 0 60px rgba(59,130,246,0.2), inset 0 0 40px rgba(59,130,246,0.05);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    border: 1px solid rgba(59,130,246,0.15);
    animation: spin-slow 8s linear infinite;
  }
  &::after {
    content: '';
    position: absolute;
    inset: -24px;
    border-radius: 50%;
    border: 1px dashed rgba(59,130,246,0.08);
    animation: spin-slow 14s linear infinite reverse;
  }
`;

const BrandTitle = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(135deg, #f0f6ff 0%, #3b82f6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  text-align: center;
`;

const FeatureList = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 320px;
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(59,130,246,0.05);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 10px;
  font-size: 13px;
  color: #94a3b8;

  .icon {
    font-size: 20px;
    flex-shrink: 0;
  }
`;

// Right panel — form
const RightPanel = styled.div`
  width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  position: relative;
  background: rgba(10, 14, 26, 0.8);

  @media (max-width: 900px) {
    width: 100%;
    padding: 40px 24px;
  }
`;

const FormCard = styled(motion.div)`
  width: 100%;
  max-width: 380px;
`;

const AdminBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(168,85,247,0.1);
  border: 1px solid rgba(168,85,247,0.3);
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  color: #a855f7;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 24px;
`;

const FormTitle = styled.h2`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #f0f6ff;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
`;

const InputWithIcon = styled.div`
  position: relative;
  svg {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    font-size: 17px;
    pointer-events: none;
  }
  input { padding-left: 40px; }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: #334155;
  font-size: 12px;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: #1e293b; }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
  margin-top: 24px;
  transition: color 0.2s;
  &:hover { color: #3b82f6; }
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16,185,129,0.6);
  animation: ${blink} 2s ease-in-out infinite;
  margin-right: 6px;
`;

const ErrorBox = styled.div`
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #f87171;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const features = [
  { icon: '🅿️', text: 'Create and manage parking slots' },
  { icon: '👥', text: 'Control user roles and access' },
  { icon: '📋', text: 'View and override all bookings' },
  { icon: '📊', text: 'Real-time occupancy analytics' },
  { icon: '⏳', text: 'Manage waitlist queue' },
];

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.');
        localStorage.removeItem('kpark_token');
        localStorage.removeItem('kpark_user');
        return;
      }
      toast.success(`Welcome, Admin ${user.name}! 🛡️`);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <GridBg />
      <ScanLine />
      <HexShape size="120px" dur="7s" delay="0s" style={{ top: '5%', left: '5%' }}>⬡</HexShape>
      <HexShape size="80px" dur="9s" delay="2s" style={{ top: '60%', left: '20%' }}>⬡</HexShape>
      <HexShape size="60px" dur="5s" delay="1s" style={{ top: '30%', left: '40%' }}>⬡</HexShape>

      {/* Left branding panel */}
      <LeftPanel>
        <ShieldOrb
          animate={{ boxShadow: ['0 0 40px rgba(59,130,246,0.15)', '0 0 80px rgba(59,130,246,0.3)', '0 0 40px rgba(59,130,246,0.15)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🛡️
        </ShieldOrb>

        <BrandTitle>K-PARK</BrandTitle>
        <p style={{ color: '#475569', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center' }}>
          Admin Control Center
        </p>

        <FeatureList>
          {features.map((f, i) => (
            <FeatureItem key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}>
              <span className="icon">{f.icon}</span>
              {f.text}
            </FeatureItem>
          ))}
        </FeatureList>
      </LeftPanel>

      {/* Right form panel */}
      <RightPanel>
        <FormCard
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>

          <AdminBadge>
            <MdShield /> Admin Portal
          </AdminBadge>

          <FormTitle>Administrator Sign In</FormTitle>
          <p style={{ color: '#475569', fontSize: 13, marginBottom: 32 }}>
            <StatusDot />Secure access — admin credentials only
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputGroup>
                <Label>Admin Email</Label>
                <InputWithIcon>
                  <MdEmail />
                  <Input
                    type="email"
                    placeholder="admin@company.com"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </InputWithIcon>
              </InputGroup>

              <InputGroup>
                <Label>Password</Label>
                <InputWithIcon>
                  <MdLock />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </InputWithIcon>
              </InputGroup>
            </div>

            {error && (
              <ErrorBox>
                🚫 {error}
              </ErrorBox>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              style={{
                marginTop: 24,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
              }}
              disabled={loading}>
              {loading ? <Spinner size="18px" /> : <><MdAdminPanelSettings /> Access Admin Panel</>}
            </Button>
          </form>

          <Divider>or</Divider>

          <BackLink to="/login">
            <MdArrowBack /> Back to User Login
          </BackLink>
        </FormCard>
      </RightPanel>
    </Page>
  );
}
