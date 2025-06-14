import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 280px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 40px;
  text-align: center;
`;

const NavigationItem = styled.div<{ active: boolean }>`
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 15px;
  cursor: pointer;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  background: ${props => props.active 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'transparent'
  };
  border: 1px solid ${props => props.active 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'transparent'
  };

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(5px);
  }
`;

const StatusIndicator = styled.div<{ status: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'healthy': return '#4CAF50';
      case 'degraded': return '#FF9800';
      default: return '#F44336';
    }
  }};
  display: inline-block;
  margin-right: 10px;
`;

const StatusSection = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatusText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
  margin-bottom: 10px;
`;

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  systemStatus: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, systemStatus }) => {
  const navigationItems = [
    { key: 'chat', label: '💬 AI Chat', description: 'Natural language queries' },
    { key: 'workflows', label: '🔄 Workflows', description: 'Restack orchestration' },
    { key: 'schema', label: '🗄️ Schema', description: 'Database structure' },
    { key: 'status', label: '📊 System Status', description: 'Health monitoring' },
  ];

  return (
    <SidebarContainer>
      <Logo>POC 3</Logo>
      
      {navigationItems.map(item => (
        <NavigationItem
          key={item.key}
          active={currentView === item.key}
          onClick={() => onViewChange(item.key)}
        >
          <div style={{ fontSize: '16px', marginBottom: '4px' }}>
            {item.label}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            {item.description}
          </div>
        </NavigationItem>
      ))}

      <StatusSection>
        <StatusText>System Status:</StatusText>
        <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <StatusIndicator 
            status={systemStatus?.status || 'unknown'} 
          />
          <span style={{ textTransform: 'capitalize' }}>
            {systemStatus?.status || 'Unknown'}
          </span>
        </div>
        
        {systemStatus?.components && (
          <div style={{ marginTop: '15px', fontSize: '0.8em' }}>
            <div>Database: {systemStatus.components.database}</div>
            <div>AI Agent: {systemStatus.components.ai_agent}</div>
            <div>Restack: {systemStatus.components.restack}</div>
          </div>
        )}
      </StatusSection>
    </SidebarContainer>
  );
};

export default Sidebar;