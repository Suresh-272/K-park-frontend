// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button, Input, InputGroup, Label, Spinner } from '../components/common/UI';
import { MdEmail, MdLock, MdPerson, MdPhone, MdDirectionsCar, MdWork } from 'react-icons/md';

const float = keyframes`0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}`;

const Page = styled.div`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  position: relative;
  overflow: hidden;
`;

const BgOrb = styled.div`
  position: fixed;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  opacity: 0.12;
  &:nth-child(1){width:500px;height:500px;background:#3b82f6;top:-200px;right:-150px;}
  &:nth-child(2){width:350px;height:350px;background:#06b6d4;bottom:-100px;left:-100px;}
`;

const FloatIcon = styled.div`
  position: fixed;
  animation: ${float} ${({ dur }) => dur || '5s'} ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || '0s'};
  opacity: 0.1;
  user-select: none;
  pointer-events: none;
  font-size: ${({ size }) => size || '28px'};
  @media (max-width: 480px) { display: none; }
`;

const FormCard = styled(motion.div)`
  width: 100%;
  max-width: 440px;
  background: rgba(15,21,38,0.9);
  border: 1px solid rgba(99,179,237,0.15);
  border-radius: 20px;
  padding: 32px 28px;
  backdrop-filter: blur(24px);
  position: relative;
  z-index: 1;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);

  &::before {
    content:'';
    position:absolute; top:0;left:0;right:0;height:1px;
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent);
    border-radius: 20px 20px 0 0;
  }

  @media (max-width: 480px) {
    padding: 24px 20px;
    border-radius: 18px;
    max-width: 100%;
  }
`;

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 24px;

  .logo-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 4px;
  }
  .logo-img {
    width: 52px; height: 52px;
    border-radius: 14px;
    object-fit: cover;
    box-shadow: 0 0 20px rgba(59,130,246,0.3);
  }
  .brand {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    background: linear-gradient(135deg, #f0f6ff 0%, #3b82f6 50%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sub {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-top: 4px;
  }
`;

const Tabs = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 3px;
  margin-bottom: 22px;
`;

const Tab = styled.button.withConfig({ shouldForwardProp: p => p !== "active" })`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.body};
  transition: all 0.25s;
  cursor: pointer;
  min-height: 44px;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? '#fff' : theme.colors.textSecondary};
  box-shadow: ${({ active }) => active ? '0 2px 12px rgba(59,130,246,0.4)' : 'none'};
  -webkit-tap-highlight-color: transparent;
`;

const IconInput = styled.div`
  position: relative;
  svg { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#475569; font-size:17px; pointer-events:none; }
  input, select { padding-left: 40px; }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || '1fr'};
  gap: 13px;
  @media (max-width: 400px) { grid-template-columns: 1fr; }
`;

const StyledSelect = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 12px 14px 12px 40px;
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.body};
  width: 100%;
  outline: none;
  min-height: 48px;
  -webkit-appearance: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
  option { background: ${({ theme }) => theme.colors.bgCard}; }
`;

const ErrorBox = styled.div`
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.22);
  border-radius: 9px;
  padding: 10px 14px;
  font-size: 13px;
  color: #f87171;
  margin-top: 12px;
`;

const AdminLink = styled.div`
  text-align: right;
  margin-bottom: 18px;
  a {
    font-size: 12px;
    color: #6b7280;
    transition: color 0.2s;
    &:hover { color: #a855f7; }
  }
`;

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name:'', email:'', password:'', phone:'', role:'employee', vehicleNumber:'' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(loginForm.email, loginForm.password);
      toast.success(`Welcome back, ${user.name}! 🚗`);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // ── Frontend validation ──────────────────────────────────────────────────
    if (!regForm.name.trim() || regForm.name.trim().length < 2) {
      return setError('Name must be at least 2 characters.');
    }
    if (!/^\S+@\S+\.\S+$/.test(regForm.email)) {
      return setError('Please enter a valid email address.');
    }

    // Normalize phone: strip spaces/dashes, add +91 if needed
    const rawDigits = regForm.phone.replace(/\D/g, '');
    let normalizedPhone = regForm.phone.trim();
    if (rawDigits.length === 10) normalizedPhone = `+91${rawDigits}`;
    else if (rawDigits.startsWith('91') && rawDigits.length === 12) normalizedPhone = `+${rawDigits}`;
    else if (rawDigits.startsWith('0') && rawDigits.length === 11) normalizedPhone = `+91${rawDigits.slice(1)}`;

    if (!/^\+91[6-9]\d{9}$/.test(normalizedPhone)) {
      return setError('Phone must be a valid Indian mobile number (10 digits, starting with 6-9). E.g. 98765 43210');
    }

    if (regForm.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (!regForm.vehicleNumber.trim()) {
      return setError('Vehicle number is required.');
    }

    setLoading(true);
    try {
      const user = await register({ ...regForm, phone: normalizedPhone });
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <Page>
      <BgOrb /><BgOrb />
      <FloatIcon size="36px" dur="6s" style={{ top:'8%', left:'6%' }}>🅿️</FloatIcon>
      <FloatIcon size="26px" dur="5s" delay="1s" style={{ top:'25%', right:'8%' }}>🚗</FloatIcon>
      <FloatIcon size="30px" dur="7s" delay="2s" style={{ bottom:'18%', left:'10%' }}>🔑</FloatIcon>

      <FormCard initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
        <LogoArea>
          <div className="logo-row">
            <img src="/logo.png" alt="K-Park" className="logo-img" />
            <div className="brand">K-PARK</div>
          </div>
          <div className="sub">Smart Corporate Parking</div>
        </LogoArea>

        <Tabs>
          <Tab active={tab==='login'} onClick={() => { setTab('login'); setError(''); }}>Sign In</Tab>
          <Tab active={tab==='register'} onClick={() => { setTab('register'); setError(''); }}>Register</Tab>
        </Tabs>

        <AdminLink>
          <a href="/admin/login">🛡️ Admin Portal →</a>
        </AdminLink>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form key="login" onSubmit={handleLogin}
              initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:16 }} transition={{ duration:0.18 }}>
              <FormGrid style={{ marginBottom: 6 }}>
                <InputGroup>
                  <Label>Email</Label>
                  <IconInput>
                    <MdEmail />
                    <Input type="email" placeholder="you@company.com" required
                      value={loginForm.email} onChange={e => setLoginForm({...loginForm, email:e.target.value})} />
                  </IconInput>
                </InputGroup>
                <InputGroup>
                  <Label>Password</Label>
                  <IconInput>
                    <MdLock />
                    <Input type="password" placeholder="••••••••" required
                      value={loginForm.password} onChange={e => setLoginForm({...loginForm, password:e.target.value})} />
                  </IconInput>
                </InputGroup>
              </FormGrid>
              {error && <ErrorBox>🚫 {error}</ErrorBox>}
              <Button type="submit" fullWidth size="lg" style={{ marginTop:18 }} disabled={loading}>
                {loading ? <Spinner size="18px" /> : 'Sign In'}
              </Button>
            </motion.form>
          ) : (
            <motion.form key="register" onSubmit={handleRegister}
              initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-16 }} transition={{ duration:0.18 }}>
              <FormGrid cols="1fr 1fr" style={{ marginBottom: 6 }}>
                <InputGroup>
                  <Label>Full Name</Label>
                  <IconInput>
                    <MdPerson />
                    <Input placeholder="John Doe" required
                      value={regForm.name} onChange={e => setRegForm({...regForm, name:e.target.value})} />
                  </IconInput>
                </InputGroup>
                <InputGroup>
                  <Label>Role</Label>
                  <IconInput>
                    <MdWork />
                    <StyledSelect value={regForm.role} onChange={e => setRegForm({...regForm, role:e.target.value})}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </StyledSelect>
                  </IconInput>
                </InputGroup>
                <InputGroup style={{ gridColumn:'1/-1' }}>
                  <Label>Email</Label>
                  <IconInput>
                    <MdEmail />
                    <Input type="email" placeholder="you@company.com" required
                      value={regForm.email} onChange={e => setRegForm({...regForm, email:e.target.value})} />
                  </IconInput>
                </InputGroup>
                <InputGroup>
                  <Label>Phone Number</Label>
                  <IconInput>
                    <MdPhone />
                    <Input
                      placeholder="98765 43210"
                      required
                      inputMode="numeric"
                      maxLength={13}
                      value={regForm.phone}
                      onChange={e => setRegForm({...regForm, phone: e.target.value})}
                    />
                  </IconInput>
                  <span style={{ fontSize:10, color:'#475569', marginTop:3, display:'block' }}>
                    Indian mobile number (10 digits, e.g. 98765 43210 or +91...)
                  </span>
                </InputGroup>
                <InputGroup>
                  <Label>Vehicle No.</Label>
                  <IconInput>
                    <MdDirectionsCar />
                    <Input placeholder="MH12AB1234" required
                      value={regForm.vehicleNumber} onChange={e => setRegForm({...regForm, vehicleNumber:e.target.value.toUpperCase()})} />
                  </IconInput>
                </InputGroup>
                <InputGroup style={{ gridColumn:'1/-1' }}>
                  <Label>Password</Label>
                  <IconInput>
                    <MdLock />
                    <Input type="password" placeholder="Min 6 characters" required minLength={6}
                      value={regForm.password} onChange={e => setRegForm({...regForm, password:e.target.value})} />
                  </IconInput>
                </InputGroup>
              </FormGrid>
              {error && <ErrorBox>🚫 {error}</ErrorBox>}
              <Button type="submit" fullWidth size="lg" style={{ marginTop:18 }} disabled={loading}>
                {loading ? <Spinner size="18px" /> : 'Create Account'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </FormCard>
    </Page>
  );
}