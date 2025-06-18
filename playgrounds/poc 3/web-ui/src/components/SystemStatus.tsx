import React from 'react';

interface SystemStatusProps {
  status: any;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>System Status</h2>
      <div style={{ 
        background: status?.status === 'healthy' ? '#e8f5e8' : '#fee', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '20px'
      }}>
        <h3>Overall Status: {status?.status || 'Unknown'}</h3>
        
        {status?.components && (
          <div style={{ marginTop: '20px' }}>
            <h4>Components:</h4>
            <ul>
              <li>Database: {status.components.database}</li>
              <li>AI Agent: {status.components.ai_agent}</li>
              <li>Restack: {status.components.restack}</li>
            </ul>
          </div>
        )}
        
        {status?.version && (
          <p><strong>Version:</strong> {status.version}</p>
        )}
        
        {status?.timestamp && (
          <p><strong>Last Check:</strong> {new Date(status.timestamp).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;