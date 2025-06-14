import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import WorkflowVisualization from './components/WorkflowVisualization';
import SchemaViewer from './components/SchemaViewer';
import SystemStatus from './components/SystemStatus';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ApiService } from './services/ApiService';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px 0 0 20px;
  margin: 20px 0 20px 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 30px;
  overflow: auto;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingContent = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface SystemStatusType {
  status: string;
  components: {
    database: string;
    ai_agent: string;
    restack: string;
  };
  version: string;
}

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [systemStatus, setSystemStatus] = useState<SystemStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check system status
      const status = await ApiService.getSystemStatus();
      setSystemStatus(status);

      // Wait a bit to show the loading screen
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize application');
      console.error('App initialization failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface />;
      case 'workflows':
        return <WorkflowVisualization />;
      case 'schema':
        return <SchemaViewer />;
      case 'status':
        return <SystemStatus status={systemStatus} />;
      default:
        return <ChatInterface />;
    }
  };

  if (loading) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <LoadingSpinner />
          <h2>Initializing POC 3</h2>
          <p>Setting up AI-powered database management...</p>
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  if (error) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <h2 style={{ color: '#e74c3c' }}>Initialization Failed</h2>
          <p>{error}</p>
          <button 
            onClick={initializeApp}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Retry
          </button>
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  return (
    <Router>
      <AppContainer>
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          systemStatus={systemStatus}
        />
        <MainContent>
          <Header 
            currentView={currentView}
            systemStatus={systemStatus}
          />
          <ContentArea>
            <Routes>
              <Route path="/" element={renderCurrentView()} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/workflows" element={<WorkflowVisualization />} />
              <Route path="/schema" element={<SchemaViewer />} />
              <Route path="/status" element={<SystemStatus status={systemStatus} />} />
            </Routes>
          </ContentArea>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;