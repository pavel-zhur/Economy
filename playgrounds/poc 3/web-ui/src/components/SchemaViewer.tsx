import React from 'react';

const SchemaViewer: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Database Schema</h2>
      <p>View and manage your PostgreSQL database schema.</p>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '40px', 
        borderRadius: '10px',
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <p>🗄️ Schema viewer coming soon...</p>
        <p>Will show database tables, columns, relationships, and allow schema modifications</p>
      </div>
    </div>
  );
};

export default SchemaViewer;