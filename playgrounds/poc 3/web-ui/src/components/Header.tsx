import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => {
    switch (props.status) {
      case 'healthy': return 'linear-gradient(135deg, #4CAF50, #45a049)';
      case 'degraded': return 'linear-gradient(135deg, #FF9800, #f57c00)';
      default: return 'linear-gradient(135deg, #F44336, #d32f2f)';
    }
  }};
  color: white;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

interface HeaderProps {
  currentView: string;
  systemStatus: any;
}

const viewTitles: Record<string, string> = {
  chat: 'AI Chat Interface',
  workflows: 'Workflow Visualization', 
  schema: 'Database Schema',
  status: 'System Status'
};

const Header: React.FC<HeaderProps> = ({ currentView, systemStatus }) => {
  return (
    <HeaderContainer>
      <Title>{viewTitles[currentView] || 'POC 3 Dashboard'}</Title>
      <StatusBadge status={systemStatus?.status || 'unknown'}>
        {systemStatus?.status || 'Unknown'}
      </StatusBadge>
    </HeaderContainer>
  );
};

export default Header;