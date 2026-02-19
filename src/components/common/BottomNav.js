// src/components/common/BottomNav.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { MdDashboard, MdLocalParking, MdBookmark, MdQueue, MdPerson, MdAdminPanelSettings } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const Nav = styled.nav`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 200;
    background: rgba(8, 12, 22, 0.97);
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
    justify-content: space-around;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  padding: 6px 2px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 52px;

  svg { font-size: 21px; }

  .label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background: rgba(59,130,246,0.1);
  }

  &:active { transform: scale(0.9); }
`;

const AdminNavItem = styled(NavItem)`
  &.active { color: #a855f7; background: rgba(168,85,247,0.1); }
`;

const ProfileNavItem = styled(NavItem)`
  &.active { color: #06b6d4; background: rgba(6,182,212,0.1); }
`;

export default function BottomNav() {
  const { user } = useAuth();

  return (
    <Nav>
      <NavItem to="/dashboard"><MdDashboard /><span className="label">Home</span></NavItem>
      <NavItem to="/slots"><MdLocalParking /><span className="label">Slots</span></NavItem>
      <NavItem to="/bookings"><MdBookmark /><span className="label">Bookings</span></NavItem>
      <NavItem to="/waitlist"><MdQueue /><span className="label">Waitlist</span></NavItem>
      <ProfileNavItem to="/profile"><MdPerson /><span className="label">Profile</span></ProfileNavItem>
      {user?.role === 'admin' && (
        <AdminNavItem to="/admin/dashboard"><MdAdminPanelSettings /><span className="label">Admin</span></AdminNavItem>
      )}
    </Nav>
  );
}