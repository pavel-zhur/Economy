import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { ApiService, ChatRequest, ChatResponse } from '../services/ApiService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const Message = styled.div<{ isUser: boolean }>`
  margin-bottom: 20px;
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 15px 20px;
  border-radius: ${props => props.isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px'};
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  };
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    ${props => props.isUser ? 'right: -8px' : 'left: -8px'};
    bottom: 0;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-top-color: ${props => props.isUser ? '#764ba2' : '#f5576c'};
    border-${props => props.isUser ? 'right' : 'left'}: none;
    margin-bottom: -8px;
  }
`;

const SqlBlock = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ExecutionResult = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.9em;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: flex-end;
`;

const InputArea = styled.textarea`
  flex: 1;
  min-height: 50px;
  max-height: 150px;
  padding: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  padding: 15px 25px;
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px;

  div {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: loading 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }

  @keyframes loading {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const WorkflowBadge = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-top: 8px;
`;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sqlGenerated?: string;
  executionResult?: any;
  workflowId?: string;
  error?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: uuidv4(),
      text: "Hello! I'm your AI database assistant. I can help you with:\n\n• Writing and executing SQL queries\n• Creating database schemas\n• Modifying existing tables\n• Explaining database concepts\n\nJust ask me anything in natural language!",
      isUser: false,
      timestamp: new Date()
    }]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const request: ChatRequest = {
        message: inputText,
        session_id: sessionId,
        use_workflow: true
      };

      const response: ChatResponse = await ApiService.chat(request);

      const aiMessage: Message = {
        id: uuidv4(),
        text: response.ai_response,
        isUser: false,
        timestamp: new Date(),
        sqlGenerated: response.sql_generated,
        executionResult: response.execution_result,
        workflowId: response.workflow_id,
        error: response.error
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUser: false,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => (
    <Message key={message.id} isUser={message.isUser}>
      <MessageBubble isUser={message.isUser}>
        <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
        
        {message.sqlGenerated && (
          <SqlBlock>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>
              Generated SQL:
            </div>
            <SyntaxHighlighter
              language="sql"
              style={tomorrow}
              customStyle={{
                margin: 0,
                borderRadius: '5px',
                fontSize: '0.9em'
              }}
            >
              {message.sqlGenerated}
            </SyntaxHighlighter>
          </SqlBlock>
        )}

        {message.executionResult && (
          <ExecutionResult>
            <strong>Result:</strong> {JSON.stringify(message.executionResult, null, 2)}
          </ExecutionResult>
        )}

        {message.workflowId && (
          <WorkflowBadge>
            Workflow: {message.workflowId}
          </WorkflowBadge>
        )}

        {message.error && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: 'rgba(244, 67, 54, 0.1)', 
            borderRadius: '5px',
            color: '#f44336'
          }}>
            Error: {message.error}
          </div>
        )}
      </MessageBubble>
    </Message>
  );

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map(renderMessage)}
        {isLoading && (
          <Message isUser={false}>
            <MessageBubble isUser={false}>
              <LoadingDots>
                <div />
                <div />
                <div />
              </LoadingDots>
            </MessageBubble>
          </Message>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputArea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your database..."
          disabled={isLoading}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;