// src/components/common/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdLocalParking, MdBookmark, MdQueue,
  MdAdminPanelSettings, MdLogout, MdMenu, MdClose,
  MdPerson, MdArrowDropDown
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const glow = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const SidebarWrap = styled(motion.aside)`
  width: 260px;
  min-height: 100vh;
  background: rgba(10, 14, 26, 0.95);
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  padding: 0 0 24px;
  backdrop-filter: blur(20px);

  @media (max-width: 900px) {
    transform: translateX(${({ open }) => open ? '0' : '-100%'});
    transition: transform 0.3s ease;
    width: 260px;
  }
`;

const Logo = styled.div`
  padding: 28px 24px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;

  .brand {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.4rem;
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
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    margin-right: 6px;
    animation: ${glow} 2s ease-in-out infinite;
  }
`;

const NavSection = styled.div`
  padding: 0 12px;
  margin-bottom: 8px;

  .section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${({ theme }) => theme.colors.textMuted};
    padding: 0 12px;
    margin-bottom: 4px;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s;
  margin-bottom: 2px;
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
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 3px;
      background: ${({ theme }) => theme.colors.primary};
      border-radius: 0 4px 4px 0;
    }
  }
`;

const UserCard = styled.div`
  margin: auto 12px 0;
  padding: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  .name { font-weight: 600; font-size: 14px; }
  .role {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.accent};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  .vehicle { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  margin-top: 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 0.2s;

  &:hover {
    background: rgba(239,68,68,0.1);
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 200;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  font-size: 20px;

  @media (max-width: 900px) { display: flex; }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: ${({ open }) => open ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 99;
  }
`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/slots', icon: <MdLocalParking />, label: 'Parking Slots' },
    { to: '/bookings', icon: <MdBookmark />, label: 'My Bookings' },
    { to: '/waitlist', icon: <MdQueue />, label: 'Waitlist' },
  ];

  const adminItems = [
    { to: '/admin/dashboard', icon: <MdAdminPanelSettings />, label: 'Admin Panel' },
    { to: '/admin/users', icon: <MdPerson />, label: 'Users' },
    { to: '/admin/bookings', icon: <MdBookmark />, label: 'All Bookings' },
  ];

  return (
    <>
      <MobileToggle onClick={() => setOpen(!open)}>
        {open ? <MdClose /> : <MdMenu />}
      </MobileToggle>
      <Overlay open={open} onClick={() => setOpen(false)} />

      <SidebarWrap open={open}>
        <Logo>
          <div className="brand">⬡ K-PARK</div>
          <div className="tagline"><span className="dot" />Smart Parking System</div>
        </Logo>

        <NavSection>
          <div className="section-label">Navigation</div>
          {navItems.map(item => (
            <NavItem key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.icon}
              {item.label}
            </NavItem>
          ))}
        </NavSection>

        {user?.role === 'admin' && (
          <NavSection>
            <div className="section-label">Administration</div>
            {adminItems.map(item => (
              <NavItem key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.icon}
                {item.label}
              </NavItem>
            ))}
          </NavSection>
        )}

        <UserCard>
          <div className="name">{user?.name}</div>
          <div className="role">{user?.role}</div>
          <div className="vehicle">🚗 {user?.vehicleNumber}</div>
          <LogoutBtn onClick={handleLogout}>
            <MdLogout size={16} /> Sign Out
          </LogoutBtn>
        </UserCard>
      </SidebarWrap>
    </>
  );
}
