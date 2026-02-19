// src/pages/ProfilePage.js
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MdPerson, MdEdit, MdLock, MdDirectionsCar, MdPhone,
  MdEmail, MdBadge, MdCheckCircle, MdClose, MdSave,
  MdVisibility, MdVisibilityOff, MdShield, MdAccessTime,
  MdLocalParking, MdBookmark
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { authAPI, bookingAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge,
  Button, Input, InputGroup, Label, Flex, Spinner, Divider
} from '../components/common/UI';
import Layout from '../components/common/Layout';

// ── Animations ────────────────────────────────────────────────────────────────
const pulse = keyframes`0%,100%{transform:scale(1);}50%{transform:scale(1.06);}`;
const shimmer = keyframes`0%{background-position:-200% center;}100%{background-position:200% center;}`;

// ── Styled Components (all custom props blocked from DOM) ─────────────────────
const AvatarRing = styled.div`
  width: 90px; height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #06b6d4, #a855f7);
  padding: 3px;
  flex-shrink: 0;
  animation: ${pulse} 4s ease-in-out infinite;

  @media (max-width: 480px) { width: 72px; height: 72px; }
`;

const AvatarInner = styled.div`
  width: 100%; height: 100%;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.bgCard};
  display: flex; align-items: center; justify-content: center;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 2rem; font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 480px) { font-size: 1.5rem; }
`;

const HeroBanner = styled(motion.div)`
  background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.07) 50%, rgba(6,182,212,0.06) 100%);
  border: 1px solid rgba(59,130,246,0.18);
  border-radius: 18px;
  padding: 24px 28px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '⬡';
    position: absolute; right: 20px; top: 50%;
    transform: translateY(-50%);
    font-size: 7rem; opacity: 0.04;
    pointer-events: none;
  }

  @media (max-width: 480px) { padding: 18px 16px; }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 500px) { grid-template-columns: 1fr; gap: 8px; }
`;

const InfoChip = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 11px 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;

  .icon { font-size: 17px; color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; }
  .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: ${({ theme }) => theme.colors.textMuted}; }
  .value { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textPrimary}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

const SectionCard = styled(Card)`
  padding: 20px;
  margin-bottom: 14px;

  @media (max-width: 480px) { padding: 16px; }
`;

const SectionHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18px;
  flex-wrap: wrap; gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const PasswordInput = styled.div`
  position: relative;
  input { padding-right: 44px; }
  button {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer; font-size: 18px; padding: 4px; display: flex; align-items: center;
    min-height: 32px;
  }
`;

const StatBadge = styled.div.withConfig({
  shouldForwardProp: (p) => p !== 'accent',
})`
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  background: ${({ accent }) => accent ? `rgba(${accent}, 0.08)` : 'rgba(59,130,246,0.08)'};
  border: 1px solid ${({ accent }) => accent ? `rgba(${accent}, 0.2)` : 'rgba(59,130,246,0.2)'};
  border-radius: 12px;
  flex: 1;

  .num {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.4rem; font-weight: 800;
    color: rgb(${({ accent }) => accent || '59,130,246'});
    line-height: 1;
  }
  .lbl { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px; }
`;

const RolePill = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  background: ${({ role }) =>
    role === 'admin' ? 'rgba(168,85,247,0.15)' :
    role === 'manager' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.12)'};
  color: ${({ role }) =>
    role === 'admin' ? '#a855f7' : role === 'manager' ? '#f59e0b' : '#3b82f6'};
  border: 1px solid ${({ role }) =>
    role === 'admin' ? 'rgba(168,85,247,0.3)' :
    role === 'manager' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.25)'};
`;

const SaveBar = styled(motion.div)`
  position: fixed;
  bottom: 80px; left: 50%; transform: translateX(-50%);
  z-index: 200;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: 14px;
  padding: 12px 20px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  white-space: nowrap;

  @media (min-width: 901px) { bottom: 24px; }
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const { user, login } = useAuth();

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    vehicleNumber: user?.vehicleNumber || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  React.useEffect(() => {
    bookingAPI.getMy({})
      .then(res => {
        const all = res?.data?.data || [];
        setStats({
          total: all.length,
          active: all.filter(b => b.status === 'active').length,
          completed: all.filter(b => b.status === 'completed').length,
          cancelled: all.filter(b => b.status === 'cancelled').length,
        });
      })
      .catch(() => setStats({ total: 0, active: 0, completed: 0, cancelled: 0 }))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setProfileDirty(true);
  };

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) { toast.error('Name cannot be empty'); return; }
    if (!profileForm.vehicleNumber.trim()) { toast.error('Vehicle number cannot be empty'); return; }
    setProfileSaving(true);
    try {
      await authAPI.updateProfile(profileForm);
      // Refresh user from server
      const res = await authAPI.getMe();
      const updated = res.data.data.user;
      localStorage.setItem('kpark_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage')); // notify AuthContext
      toast.success('✅ Profile updated!');
      setEditMode(false);
      setProfileDirty(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setProfileSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('🔒 Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  const cancelEdit = () => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '', vehicleNumber: user?.vehicleNumber || '' });
    setEditMode(false);
    setProfileDirty(false);
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A';

  return (
    <Layout>
      <PageWrapper variants={container} initial="hidden" animate="show">
        <PageHeader>
          <motion.div variants={item}>
            <Title size="1.6rem">My Profile</Title>
            <Text muted size="13px" style={{ marginTop: 3 }}>Manage your account details</Text>
          </motion.div>
        </PageHeader>

        {/* ── Hero Banner ───────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <HeroBanner>
            <Flex gap="18px" align="center" wrap="wrap">
              <AvatarRing>
                <AvatarInner>{initials}</AvatarInner>
              </AvatarRing>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Flex gap="8px" align="center" wrap="wrap" style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: 800, fontSize: 20, fontFamily: 'Orbitron, sans-serif' }}>
                    {user?.name}
                  </Text>
                  <RolePill role={user?.role}>
                    {user?.role === 'admin' ? '🛡️' : user?.role === 'manager' ? '⭐' : '👤'} {user?.role}
                  </RolePill>
                </Flex>
                <Text muted size="13px">{user?.email}</Text>
                <Flex gap="6px" align="center" style={{ marginTop: 6 }}>
                  <MdAccessTime size={13} color="#475569" />
                  <Text muted size="12px">Member since {memberSince}</Text>
                </Flex>
              </div>
            </Flex>

            <InfoGrid>
              <InfoChip>
                <div className="icon"><MdPhone /></div>
                <div>
                  <div className="label">WhatsApp</div>
                  <div className="value">{user?.phone || '—'}</div>
                </div>
              </InfoChip>
              <InfoChip>
                <div className="icon"><MdDirectionsCar /></div>
                <div>
                  <div className="label">Vehicle No.</div>
                  <div className="value" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {user?.vehicleNumber || '—'}
                  </div>
                </div>
              </InfoChip>
              <InfoChip>
                <div className="icon"><MdEmail /></div>
                <div>
                  <div className="label">Email</div>
                  <div className="value">{user?.email}</div>
                </div>
              </InfoChip>
              <InfoChip>
                <div className="icon"><MdBadge /></div>
                <div>
                  <div className="label">Account Status</div>
                  <div className="value" style={{ color: '#10b981' }}>
                    <MdCheckCircle size={12} style={{ marginRight: 4 }} />
                    Active
                  </div>
                </div>
              </InfoChip>
            </InfoGrid>
          </HeroBanner>
        </motion.div>

        {/* ── Booking Stats ─────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <SectionCard>
            <SectionHeader>
              <Flex gap="8px" align="center">
                <MdLocalParking size={18} color="#3b82f6" />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Booking Summary</Text>
              </Flex>
            </SectionHeader>
            {statsLoading ? (
              <Flex justify="center" style={{ padding: 20 }}><Spinner size="28px" /></Flex>
            ) : (
              <Flex gap="10px" wrap="wrap">
                <StatBadge accent="59,130,246">
                  <div>
                    <div className="num">{stats?.total ?? 0}</div>
                    <div className="lbl">Total</div>
                  </div>
                </StatBadge>
                <StatBadge accent="16,185,129">
                  <div>
                    <div className="num">{stats?.active ?? 0}</div>
                    <div className="lbl">Active</div>
                  </div>
                </StatBadge>
                <StatBadge accent="6,182,212">
                  <div>
                    <div className="num">{stats?.completed ?? 0}</div>
                    <div className="lbl">Done</div>
                  </div>
                </StatBadge>
                <StatBadge accent="239,68,68">
                  <div>
                    <div className="num">{stats?.cancelled ?? 0}</div>
                    <div className="lbl">Cancelled</div>
                  </div>
                </StatBadge>
              </Flex>
            )}
          </SectionCard>
        </motion.div>

        {/* ── Edit Profile ──────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <SectionCard>
            <SectionHeader>
              <Flex gap="8px" align="center">
                <MdPerson size={18} color="#3b82f6" />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Personal Information</Text>
              </Flex>
              {!editMode ? (
                <Button size="sm" variant="ghost" onClick={() => setEditMode(true)}>
                  <MdEdit /> Edit
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <MdClose /> Cancel
                </Button>
              )}
            </SectionHeader>

            <FormGrid>
              <InputGroup>
                <Label>Full Name</Label>
                <Input
                  value={profileForm.name}
                  readOnly={!editMode}
                  placeholder="Your full name"
                  onChange={e => handleProfileChange('name', e.target.value)}
                  style={{ opacity: editMode ? 1 : 0.75 }}
                />
              </InputGroup>
              <InputGroup>
                <Label>Email</Label>
                <Input
                  value={user?.email || ''}
                  readOnly
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                />
              </InputGroup>
              <InputGroup>
                <Label>WhatsApp Number</Label>
                <Input
                  value={profileForm.phone}
                  readOnly={!editMode}
                  placeholder="+916374..."
                  onChange={e => handleProfileChange('phone', e.target.value)}
                  style={{ opacity: editMode ? 1 : 0.75 }}
                />
              </InputGroup>
              <InputGroup>
                <Label>Vehicle Number</Label>
                <Input
                  value={profileForm.vehicleNumber}
                  readOnly={!editMode}
                  placeholder="MH12AB1234"
                  onChange={e => handleProfileChange('vehicleNumber', e.target.value.toUpperCase())}
                  style={{ opacity: editMode ? 1 : 0.75, fontFamily: 'monospace', letterSpacing: '0.05em' }}
                />
              </InputGroup>
            </FormGrid>

            {editMode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 18 }}>
                <Flex gap="10px">
                  <Button variant="ghost" fullWidth onClick={cancelEdit}>Cancel</Button>
                  <Button fullWidth onClick={handleProfileSave} disabled={profileSaving || !profileDirty}>
                    {profileSaving ? <Spinner size="16px" /> : <><MdSave /> Save Changes</>}
                  </Button>
                </Flex>
              </motion.div>
            )}

            {!editMode && (
              <Text muted size="11px" style={{ marginTop: 14 }}>
                📧 Email cannot be changed. Contact admin if needed.
              </Text>
            )}
          </SectionCard>
        </motion.div>

        {/* ── Change Password ───────────────────────────────────────────── */}
        <motion.div variants={item}>
          <SectionCard>
            <SectionHeader>
              <Flex gap="8px" align="center">
                <MdLock size={18} color="#a855f7" />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Change Password</Text>
              </Flex>
            </SectionHeader>

            <form onSubmit={handlePasswordSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InputGroup>
                  <Label>Current Password</Label>
                  <PasswordInput>
                    <Input
                      type={showPw.current ? 'text' : 'password'}
                      value={pwForm.currentPassword}
                      placeholder="Enter current password"
                      onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                      {showPw.current ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </PasswordInput>
                </InputGroup>

                <Flex gap="12px">
                  <InputGroup style={{ flex: 1 }}>
                    <Label>New Password</Label>
                    <PasswordInput>
                      <Input
                        type={showPw.new ? 'text' : 'password'}
                        value={pwForm.newPassword}
                        placeholder="Min 6 characters"
                        onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}>
                        {showPw.new ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </PasswordInput>
                  </InputGroup>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Confirm Password</Label>
                    <PasswordInput>
                      <Input
                        type={showPw.confirm ? 'text' : 'password'}
                        value={pwForm.confirmPassword}
                        placeholder="Repeat new password"
                        onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                        {showPw.confirm ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </PasswordInput>
                  </InputGroup>
                </Flex>

                {/* Password match indicator */}
                {pwForm.newPassword && pwForm.confirmPassword && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Text size="12px" style={{
                      color: pwForm.newPassword === pwForm.confirmPassword ? '#10b981' : '#ef4444'
                    }}>
                      {pwForm.newPassword === pwForm.confirmPassword
                        ? '✅ Passwords match'
                        : '❌ Passwords do not match'}
                    </Text>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="ghost"
                  style={{ marginTop: 4, borderColor: 'rgba(168,85,247,0.3)', color: '#a855f7' }}
                  disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                >
                  {pwSaving ? <Spinner size="16px" /> : <><MdShield /> Change Password</>}
                </Button>
              </div>
            </form>
          </SectionCard>
        </motion.div>

        {/* ── Account Info ──────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <SectionCard>
            <SectionHeader>
              <Flex gap="8px" align="center">
                <MdBadge size={18} color="#06b6d4" />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Account Details</Text>
              </Flex>
            </SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Account ID', value: user?._id || '—', mono: true },
                { label: 'Role', value: user?.role || '—' },
                { label: 'Member Since', value: memberSince },
                { label: 'Account Status', value: 'Active ✅' },
              ].map(row => (
                <Flex key={row.label} justify="space-between" align="center" style={{
                  padding: '10px 14px',
                  background: 'rgba(59,130,246,0.03)',
                  borderRadius: 8,
                  border: '1px solid rgba(59,130,246,0.08)',
                  gap: 10,
                }}>
                  <Text muted size="12px">{row.label}</Text>
                  <Text size="12px" style={{
                    fontWeight: 600,
                    fontFamily: row.mono ? 'monospace' : 'inherit',
                    fontSize: row.mono ? 10 : 12,
                    color: '#94a3b8',
                    wordBreak: 'break-all',
                    textAlign: 'right',
                  }}>
                    {row.value}
                  </Text>
                </Flex>
              ))}
            </div>
          </SectionCard>
        </motion.div>

      </PageWrapper>
    </Layout>
  );
}