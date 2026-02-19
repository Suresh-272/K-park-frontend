// src/components/common/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  MdDashboard, MdLocalParking, MdBookmark, MdQueue,
  MdAdminPanelSettings, MdLogout, MdMenu, MdClose,
  MdPerson, MdGridView, MdAnalytics
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const SidebarWrap = styled.aside`
  width: 260px;
  min-height: 100vh;
  background: rgba(8, 12, 22, 0.97);
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0; top: 0; bottom: 0;
  z-index: 100;
  padding: 0 0 24px;
  backdrop-filter: blur(20px);

  @media (max-width: 900px) {
    transform: translateX(${({ open }) => open ? '0' : '-100%'});
    transition: transform 0.3s ease;
  }
`;

const Logo = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 12px;

  .brand {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.3rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .tagline {
    font-size: 10px;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-top: 2px;
  }
  .dot {
    display: inline-block;
    width: 6px; height: 6px;
    background: #10b981;
    border-radius: 50%;
    margin-right: 6px;
    animation: ${glow} 2s ease-in-out infinite;
  }
`;

const NavSection = styled.div`
  padding: 0 10px;
  margin-bottom: 4px;
  flex: 0 0 auto;

  .section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${({ theme }) => theme.colors.textMuted};
    padding: 0 10px;
    margin-bottom: 2px;
    margin-top: 8px;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 13.5px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s;
  margin-bottom: 1px;
  position: relative;
  overflow: hidden;

  svg { font-size: 18px; flex-shrink: 0; }

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: rgba(59,130,246,0.08);
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background: rgba(59,130,246,0.12);
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0; top: 20%; bottom: 20%;
      width: 3px;
      background: ${({ theme }) => theme.colors.primary};
      border-radius: 0 4px 4px 0;
    }
  }
`;

const AdminNavItem = styled(NavItem)`
  &.active {
    color: #a855f7;
    background: rgba(168,85,247,0.1);
    &::before { background: #a855f7; }
  }
  &:hover { background: rgba(168,85,247,0.06); }
`;

const SectionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 10px 10px;
`;

const UserCard = styled.div`
  margin: auto 10px 0;
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  flex-shrink: 0;

  .name { font-weight: 600; font-size: 13px; }
  .role {
    font-size: 10px;
    color: ${({ isAdmin }) => isAdmin ? '#a855f7' : '#06b6d4'};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
  }
  .vehicle { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  margin-top: 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(239,68,68,0.1);
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 16px; left: 16px;
  z-index: 200;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  width: 40px; height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center; justify-content: center;
  font-size: 20px; cursor: pointer;

  @media (max-width: 900px) { display: flex; }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: ${({ open }) => open ? 'block' : 'none'};
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 99;
  }
`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setOpen(false);

  return (
    <>
      <MobileToggle onClick={() => setOpen(!open)}>
        {open ? <MdClose /> : <MdMenu />}
      </MobileToggle>
      <Overlay open={open} onClick={close} />

      <SidebarWrap open={open}>
        <Logo>
          <div className="brand">⬡ K-PARK</div>
          <div className="tagline"><span className="dot" />Smart Parking System</div>
        </Logo>

        {/* User Navigation */}
        <NavSection>
          <div className="section-label">Main</div>
          <NavItem to="/dashboard" onClick={close}><MdDashboard />Dashboard</NavItem>
          <NavItem to="/slots" onClick={close}><MdLocalParking />Parking Slots</NavItem>
          <NavItem to="/bookings" onClick={close}><MdBookmark />My Bookings</NavItem>
          <NavItem to="/waitlist" onClick={close}><MdQueue />Waitlist</NavItem>
        </NavSection>

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <SectionDivider />
            <NavSection>
              <div className="section-label">Administration</div>
              <AdminNavItem to="/admin/dashboard" onClick={close}>
                <MdAnalytics />Admin Dashboard
              </AdminNavItem>
              <AdminNavItem to="/admin/slots" onClick={close}>
                <MdGridView />Slot Management
              </AdminNavItem>
              <AdminNavItem to="/admin/users" onClick={close}>
                <MdPerson />Users
              </AdminNavItem>
              <AdminNavItem to="/admin/bookings" onClick={close}>
                <MdBookmark />All Bookings
              </AdminNavItem>
            </NavSection>
          </>
        )}

        <UserCard isAdmin={isAdmin}>
          <div className="name">{user?.name}</div>
          <div className="role">
            {isAdmin ? '🛡️ ' : ''}{user?.role}
          </div>
          <div className="vehicle">🚗 {user?.vehicleNumber}</div>
          <LogoutBtn onClick={handleLogout}>
            <MdLogout size={15} /> Sign Out
          </LogoutBtn>
        </UserCard>
      </SidebarWrap>
    </>
  );
}
