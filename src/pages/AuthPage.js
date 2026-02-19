// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button, Input, InputGroup, Label, Spinner } from '../components/common/UI';
import { MdEmail, MdLock, MdPerson, MdPhone, MdDirectionsCar, MdWork } from 'react-icons/md';

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.3; }
`;
const orbitSpin = keyframes`
  from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
`;

const BgOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.15;

  &:nth-child(1) { width: 600px; height: 600px; background: #3b82f6; top: -200px; right: -200px; }
  &:nth-child(2) { width: 400px; height: 400px; background: #06b6d4; bottom: -100px; left: -100px; }
  &:nth-child(3) { width: 300px; height: 300px; background: #a855f7; top: 50%; left: 50%; transform: translate(-50%,-50%); }
`;

const FloatingIcon = styled.div`
  position: absolute;
  font-size: ${({ size }) => size || '24px'};
  animation: ${float} ${({ duration }) => duration || '4s'} ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || '0s'};
  opacity: 0.12;
  user-select: none;
`;

const FormCard = styled(motion.div)`
  width: 100%;
  max-width: 460px;
  background: rgba(15, 21, 38, 0.85);
  border: 1px solid rgba(99, 179, 237, 0.15);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(24px);
  position: relative;
  z-index: 1;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.05);

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent);
    border-radius: 24px 24px 0 0;
  }
`;

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 32px;

  .brand {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    background: linear-gradient(135deg, #f0f6ff 0%, #3b82f6 50%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sub {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-top: 4px;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 4px;
  margin-bottom: 28px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 9px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.body};
  transition: all 0.25s;
  cursor: pointer;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? '#fff' : theme.colors.textSecondary};
  box-shadow: ${({ active }) => active ? '0 2px 12px rgba(59,130,246,0.4)' : 'none'};
`;

const InputWithIcon = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 16px;
    pointer-events: none;
  }

  input, select {
    padding-left: 38px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || '1fr'};
  gap: 14px;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const StyledSelect = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 11px 14px 11px 38px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border-color 0.2s;
  width: 100%;
  outline: none;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
  option { background: ${({ theme }) => theme.colors.bgCard}; }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  margin-top: 10px;
  text-align: center;
  background: rgba(239,68,68,0.08);
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(239,68,68,0.2);
`;

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'employee', vehicleNumber: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(loginForm.email, loginForm.password);
      toast.success(`Welcome back, ${user.name}! 🚗`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await register(regForm);
      toast.success(`Account created! Welcome, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <Page>
      <BgOrb /><BgOrb /><BgOrb />
      <FloatingIcon size="40px" duration="6s" delay="0s" style={{ top:'10%', left:'8%' }}>🅿️</FloatingIcon>
      <FloatingIcon size="28px" duration="5s" delay="1s" style={{ top:'20%', right:'10%' }}>🚗</FloatingIcon>
      <FloatingIcon size="32px" duration="7s" delay="2s" style={{ bottom:'20%', left:'12%' }}>🏢</FloatingIcon>
      <FloatingIcon size="22px" duration="4s" delay="0.5s" style={{ bottom:'30%', right:'8%' }}>🔑</FloatingIcon>

      <FormCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <LogoArea>
          <div className="brand">⬡ K-PARK</div>
          <div className="sub">Smart Corporate Parking</div>
        </LogoArea>

        <Tabs>
          <Tab active={tab === 'login'} onClick={() => { setTab('login'); setError(''); }}>Sign In</Tab>
          <Tab active={tab === 'register'} onClick={() => { setTab('register'); setError(''); }}>Register</Tab>
        </Tabs>

        <div style={{ textAlign: "right", marginBottom: 16, marginTop: -4 }}>
          <a href="/admin/login" style={{ fontSize: 12, color: "#a855f7", display: "inline-flex", alignItems: "center", gap: 4 }}>🛡️ Admin Portal →</a>
        </div>
        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form key="login" onSubmit={handleLogin}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <FormGrid style={{ marginBottom: 14 }}>
                <InputGroup>
                  <Label>Email</Label>
                  <InputWithIcon>
                    <MdEmail />
                    <Input type="email" placeholder="you@company.com" required
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                  </InputWithIcon>
                </InputGroup>
                <InputGroup>
                  <Label>Password</Label>
                  <InputWithIcon>
                    <MdLock />
                    <Input type="password" placeholder="••••••••" required
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                  </InputWithIcon>
                </InputGroup>
              </FormGrid>
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit" fullWidth size="lg" style={{ marginTop: 20 }} disabled={loading}>
                {loading ? <Spinner size="18px" /> : 'Sign In'}
              </Button>
            </motion.form>
          ) : (
            <motion.form key="register" onSubmit={handleRegister}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <FormGrid cols="1fr 1fr" style={{ marginBottom: 14 }}>
                <InputGroup>
                  <Label>Full Name</Label>
                  <InputWithIcon>
                    <MdPerson />
                    <Input placeholder="John Doe" required
                      value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
                  </InputWithIcon>
                </InputGroup>
                <InputGroup>
                  <Label>Role</Label>
                  <InputWithIcon>
                    <MdWork />
                    <StyledSelect value={regForm.role}
                      onChange={e => setRegForm({ ...regForm, role: e.target.value })}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </StyledSelect>
                  </InputWithIcon>
                </InputGroup>
                <InputGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>Email</Label>
                  <InputWithIcon>
                    <MdEmail />
                    <Input type="email" placeholder="you@company.com" required
                      value={regForm.email}
                      onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                  </InputWithIcon>
                </InputGroup>
                <InputGroup>
                  <Label>Phone (WhatsApp)</Label>
                  <InputWithIcon>
                    <MdPhone />
                    <Input placeholder="+916374900655" required
                      value={regForm.phone}
                      onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
                  </InputWithIcon>
                </InputGroup>
                <InputGroup>
                  <Label>Vehicle Number</Label>
                  <InputWithIcon>
                    <MdDirectionsCar />
                    <Input placeholder="MH12AB1234" required
                      value={regForm.vehicleNumber}
                      onChange={e => setRegForm({ ...regForm, vehicleNumber: e.target.value.toUpperCase() })} />
                  </InputWithIcon>
                </InputGroup>
                <InputGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>Password</Label>
                  <InputWithIcon>
                    <MdLock />
                    <Input type="password" placeholder="Min 6 characters" required minLength={6}
                      value={regForm.password}
                      onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
                  </InputWithIcon>
                </InputGroup>
              </FormGrid>
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit" fullWidth size="lg" style={{ marginTop: 4 }} disabled={loading}>
                {loading ? <Spinner size="18px" /> : 'Create Account'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </FormCard>
    </Page>
  );
}
