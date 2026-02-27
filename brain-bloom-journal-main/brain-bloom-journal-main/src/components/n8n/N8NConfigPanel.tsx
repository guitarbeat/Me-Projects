import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import n8nService from '../../services/n8nService';
import { N8NConfig, N8NResponse, SyncStatus } from '../../types/n8n';

const PanelContainer = styled.div`
  padding: 24px;
  margin: 20px 0;
  border-radius: 16px;
  overflow: hidden;
`;

const Title = styled.h3`
  color: #fff;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #ccc;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px;
  background: #2a2a2a;
  border: 1px solid ${props => props.hasError ? '#ff4757' : '#444'};
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ff6b7a' : '#007acc'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(255, 71, 87, 0.2)' : 'rgba(0, 122, 204, 0.2)'};
  }
  
  &::placeholder {
    color: #666;
  }
  
  &:invalid {
    border-color: #ff4757;
  }
  
  /* Enhanced accessibility */
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
  transform: scale(1.2);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 12px;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #007acc;
          color: #fff;
          &:hover { background: #005a9e; }
        `;
      case 'secondary':
        return `
          background: #444;
          color: #fff;
          &:hover { background: #555; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: #fff;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #007acc;
          color: #fff;
          &:hover { background: #005a9e; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div<{ status: SyncStatus['status'] }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  
  ${({ status }) => {
    switch (status) {
      case 'success':
        return 'background: #28a745;';
      case 'error':
        return 'background: #dc3545;';
      case 'syncing':
        return 'background: #ffc107;';
      default:
        return 'background: #6c757d;';
    }
  }}
`;

const StatusText = styled.span`
  color: #ccc;
  font-size: 0.9rem;
`;

const Alert = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return 'background: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; color: #28a745;';
      case 'error':
        return 'background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; color: #dc3545;';
      case 'info':
        return 'background: rgba(0, 122, 204, 0.1); border: 1px solid #007acc; color: #007acc;';
    }
  }}
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: #2a2a2a;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #999;
  font-size: 0.8rem;
`;

const N8NConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<N8NConfig>(n8nService.getConfig());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(n8nService.getSyncStatus());
  const [testResult, setTestResult] = useState<N8NResponse | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(n8nService.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = (key: keyof N8NConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      n8nService.updateConfig(config);
      setTestResult({
        success: true,
        message: 'Configuration saved successfully!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to save configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const result = await n8nService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    const defaultConfig = {
      baseUrl: 'https://n8n.alw.lol',
      enabled: false,
      autoSync: false,
      syncInterval: 15
    };
    setConfig(defaultConfig);
    n8nService.updateConfig(defaultConfig);
  };

  return (
    <PanelContainer className="glass-card">
      <Title>N8N Integration Configuration</Title>
      
      {testResult && (
        <Alert type={testResult.success ? 'success' : 'error'}>
          {testResult.message}
          {testResult.error && <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>{testResult.error}</div>}
        </Alert>
      )}

      <FormGroup>
        <Label htmlFor="baseUrl">N8N Base URL</Label>
        <Input
          id="baseUrl"
          type="url"
          value={config.baseUrl}
          onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
          placeholder="https://n8n.alw.lol"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="apiKey">API Key (Optional)</Label>
        <Input
          id="apiKey"
          type="password"
          value={config.apiKey || ''}
          onChange={(e) => handleConfigChange('apiKey', e.target.value)}
          placeholder="Enter your N8N API key"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="webhookUrl">Webhook URL</Label>
        <Input
          id="webhookUrl"
          type="url"
          value={config.webhookUrl || ''}
          onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
          placeholder="https://n8n.alw.lol/webhook/emotions"
        />
      </FormGroup>

      <FormGroup>
        <Label>
          <Checkbox
            id="enabled"
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleConfigChange('enabled', e.target.checked)}
          />
          Enable N8N Integration
        </Label>
      </FormGroup>

      <FormGroup>
        <Label>
          <Checkbox
            id="autoSync"
            type="checkbox"
            checked={config.autoSync}
            onChange={(e) => handleConfigChange('autoSync', e.target.checked)}
          />
          Enable Auto-Sync
        </Label>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
        <Select
          id="syncInterval"
          value={config.syncInterval}
          onChange={(e) => handleConfigChange('syncInterval', parseInt(e.target.value))}
        >
          <option value={5}>5 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={1440}>Daily</option>
        </Select>
      </FormGroup>

      <div style={{ marginBottom: '20px' }}>
        <Button onClick={handleTestConnection} disabled={isTesting}>
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button $variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
        <Button $variant="secondary" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Label>Connection Status</Label>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
          <StatusIndicator status={syncStatus.status} />
          <StatusText>
            {syncStatus.status === 'idle' && 'Idle'}
            {syncStatus.status === 'syncing' && 'Syncing...'}
            {syncStatus.status === 'success' && 'Last sync successful'}
            {syncStatus.status === 'error' && `Error: ${syncStatus.errorMessage}`}
          </StatusText>
        </div>
        {syncStatus.lastSync && (
          <StatusText style={{ marginLeft: '20px', fontSize: '0.8rem' }}>
            Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
          </StatusText>
        )}
      </div>

      <StatsContainer>
        <StatCard>
          <StatValue>{syncStatus.eventsProcessed}</StatValue>
          <StatLabel>Events Processed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{syncStatus.webhooksSent}</StatValue>
          <StatLabel>Webhooks Sent</StatLabel>
        </StatCard>
      </StatsContainer>
    </PanelContainer>
  );
};

export default N8NConfigPanel;