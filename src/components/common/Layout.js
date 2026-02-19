// src/components/common/Layout.js
import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  overflow-x: hidden;

  @media (max-width: 900px) {
    margin-left: 0;
    padding-top: 0;
  }
`;

export default function Layout({ children }) {
  return (
    <Wrapper>
      <Sidebar />
      <Main>{children}</Main>
      <BottomNav />
    </Wrapper>
  );
}
