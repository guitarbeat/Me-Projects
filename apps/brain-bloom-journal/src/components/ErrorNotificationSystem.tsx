import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ErrorNotification } from '../types/errors';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
`;

const Notification = styled.div<{ type: ErrorNotification['type']; $isExiting: boolean }>`
  background: ${props => {
    switch (props.type) {
      case 'error': return '#ff4757';
      case 'warning': return '#ffa502';
      case 'info': return '#3742fa';
      case 'success': return '#2ed573';
      default: return '#2f3542';
    }
  }};
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  animation: ${props => props.$isExiting ? slideOut : slideIn} 0.3s ease-out;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
  
  /* Enhanced accessibility */
  border: 2px solid ${props => {
    switch (props.type) {
      case 'error': return '#ff6b7a';
      case 'warning': return '#ffb82e';
      case 'info': return '#5a67fa';
      case 'success': return '#58d68d';
      default: return '#57606f';
    }
  }};
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 3px solid currentColor;
    background: ${props => {
      switch (props.type) {
        case 'error': return '#d32f2f';
        case 'warning': return '#f57c00';
        case 'info': return '#1976d2';
        case 'success': return '#388e3c';
        default: return '#424242';
      }
    }};
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: opacity 0.2s ease;
  }
  
  /* Focus management */
  &:focus-within {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  min-width: 24px;
  min-height: 24px;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
    opacity: 1;
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const ProgressBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  width: 100%;
  animation: progress ${props => props.duration}ms linear;
  transform-origin: left;

  @keyframes progress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
`;

interface NotificationSystemProps {
  notifications: ErrorNotification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  const [exitingNotifications, setExitingNotifications] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setExitingNotifications(prev => new Set(prev).add(id));
    setTimeout(() => {
      onDismiss(id);
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  // Sync exiting notifications with the actual notifications array
  useEffect(() => {
    const currentIds = new Set(notifications.map(n => n.id));
    setExitingNotifications(prev => {
      const newSet = new Set<string>();
      prev.forEach(id => {
        if (currentIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [notifications]);

  const getIcon = (type: ErrorNotification['type']) => {
    switch (type) {
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,4.5L11.5,7.5L8.5,8L11.5,8.5L12,11.5L12.5,8.5L15.5,8L12.5,7.5L12,4.5Z" />
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
        );
      case 'info':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
          </svg>
        );
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <NotificationContainer>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          $isExiting={exitingNotifications.has(notification.id)}
          role={notification.type === 'error' ? 'alert' : 'status'}
          aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
          aria-describedby={`notification-message-${notification.id}`}
          tabIndex={notification.dismissible ? 0 : -1}
        >
          <NotificationHeader>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <IconContainer aria-hidden="true">
                {getIcon(notification.type)}
              </IconContainer>
              <NotificationTitle id={`notification-title-${notification.id}`}>
                {notification.title}
              </NotificationTitle>
            </div>
            {notification.dismissible && (
              <CloseButton 
                onClick={() => handleDismiss(notification.id)}
                aria-label={`Dismiss ${notification.title} notification`}
                type="button"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  aria-hidden="true"
                  style={{ width: '16px', height: '16px' }}
                >
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </CloseButton>
            )}
          </NotificationHeader>
          
          <NotificationMessage id={`notification-message-${notification.id}`}>
            {notification.message}
          </NotificationMessage>
          
          {notification.action && (
            <ActionButton 
              onClick={notification.action.handler}
              aria-label={`${notification.action.label} for ${notification.title}`}
              type="button"
            >
              {notification.action.label}
            </ActionButton>
          )}
          
          {notification.duration && notification.duration > 0 && (
            <ProgressBar 
              duration={notification.duration}
              role="progressbar"
              aria-label="Time remaining for this notification"
            />
          )}
        </Notification>
      ))}
    </NotificationContainer>
  );
};

export default NotificationSystem;