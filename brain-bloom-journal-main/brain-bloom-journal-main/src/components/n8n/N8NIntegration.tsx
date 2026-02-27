import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import n8nService from '../../services/n8nService';
import { EmotionalEvent, EmotionalData, N8NWorkflowTemplate } from '../../types/n8n';
import { workflowTemplates } from '../../data/n8nWorkflowTemplates';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { N8NAlert } from './shared/N8NAlert';
import { N8NStatus } from './shared/N8NStatus';
import { generateMockEvents } from './shared/mockData';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #007acc, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #ccc;
  font-size: 1.1rem;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 24px;
  gap: 8px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: ${({ active }) => active ? '#007acc' : 'transparent'};
  color: ${({ active }) => active ? '#fff' : '#ccc'};
  border: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active }) => active ? '#005a9e' : '#333'};
  }
`;

const TabContent = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const ActionCard = styled.div`
  padding: 20px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
  
  &:hover {
    border-color: #007acc;
    transform: translateY(-2px);
  }
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
`;

const ActionTitle = styled.h3`
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ActionDescription = styled.p`
  color: #ccc;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const InfoPanel = styled.div`
  padding: 24px;
  margin: 20px 0;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
`;

const InfoTitle = styled.h3`
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
`;

const InfoCard = styled.div`
  text-align: center;
`;

const InfoLabel = styled.div`
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ExportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ExportCard = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #444;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007acc;
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h4`
  color: #fff;
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  color: #ccc;
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
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

const WorkflowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const WorkflowCard = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #444;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007acc;
    transform: translateY(-2px);
  }
`;

const WorkflowMeta = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const MetaTag = styled.span<{ type: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${({ type }) => {
    switch (type) {
      case 'webhook':
        return 'background: rgba(0, 122, 204, 0.2); color: #007acc; border: 1px solid #007acc;';
      case 'schedule':
        return 'background: rgba(255, 193, 7, 0.2); color: #ffc107; border: 1px solid #ffc107;';
      case 'manual':
        return 'background: rgba(108, 117, 125, 0.2); color: #6c757d; border: 1px solid #6c757d;';
      case 'wellness':
        return 'background: rgba(40, 167, 69, 0.2); color: #28a745; border: 1px solid #28a745;';
      case 'analytics':
        return 'background: rgba(220, 53, 69, 0.2); color: #dc3545; border: 1px solid #dc3545;';
      case 'notifications':
        return 'background: rgba(255, 193, 7, 0.2); color: #ffc107; border: 1px solid #ffc107;';
      case 'integrations':
        return 'background: rgba(111, 66, 193, 0.2); color: #6f42c1; border: 1px solid #6f42c1;';
      default:
        return 'background: rgba(108, 117, 125, 0.2); color: #6c757d; border: 1px solid #6c757d;';
    }
  }}
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #444;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: #007acc;
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const StatusText = styled.div`
  color: #ccc;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 8px;
`;

const RealTimeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ToggleLabel = styled.div`
  color: #fff;
  font-weight: 500;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #007acc;
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #444;
  transition: .4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

type TabType = 'overview' | 'export' | 'workflows';

const N8NIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(true);
  const [mockEvents, setMockEvents] = useState<EmotionalEvent[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Export state
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  // Workflow state
  const [templates, setTemplates] = useState<N8NWorkflowTemplate[]>([]);
  const [deployedWorkflows, setDeployedWorkflows] = useState<N8NWorkflowTemplate[]>([]);

  useEffect(() => {
    checkConnectionStatus();
    setMockEvents(generateMockEvents());
    loadTemplates();
  }, []);

  useEffect(() => {
    if (isRealTimeEnabled) {
      const interval = setInterval(() => {
        handleRealTimeSync();
      }, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealTimeEnabled, mockEvents]);

  const checkConnectionStatus = async () => {
    try {
      const config = n8nService.getConfig();
      if (config.enabled && config.baseUrl) {
        const result = await n8nService.testConnection();
        setConnectionStatus(result.success ? 'connected' : 'error');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const fetchedTemplates = await n8nService.getWorkflowTemplates();
      setTemplates(fetchedTemplates.length > 0 ? fetchedTemplates : workflowTemplates);
    } catch (error) {
      setTemplates(workflowTemplates);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'test':
        checkConnectionStatus();
        break;
      case 'sync':
        n8nService.syncEmotionalData(mockEvents);
        setAlert({ type: 'success', message: 'Data synced successfully!' });
        break;
      case 'patterns':
        n8nService.triggerPatternDetection(mockEvents);
        setAlert({ type: 'info', message: 'Pattern detection triggered!' });
        break;
      case 'export':
        setActiveTab('export');
        break;
    }
  };

  const handleExportToN8N = async (format: 'json' | 'csv' | 'summary') => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      for (let i = 0; i <= 100; i += 20) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const emotionalData = processEmotionalData(mockEvents);
      const success = await n8nService.sendWebhook('daily_summary', {
        format,
        data: emotionalData,
        exportTimestamp: new Date().toISOString()
      });

      if (success) {
        setAlert({
          type: 'success',
          message: `Data exported to N8N successfully in ${format.toUpperCase()} format!`
        });
      } else {
        setAlert({ type: 'error', message: 'Failed to export data to N8N' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Export failed' });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleRealTimeSync = async () => {
    try {
      await n8nService.syncEmotionalData(mockEvents);
    } catch (error) {
      console.error('Real-time sync failed:', error);
    }
  };

  const processEmotionalData = (events: EmotionalEvent[]): EmotionalData => {
    if (events.length === 0) {
      return {
        events: [],
        summary: {
          totalEvents: 0,
          dateRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString()
          },
          emotionDistribution: {},
          averageIntensity: 0
        }
      };
    }

    const sortedEvents = events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const emotionDistribution: Record<string, number> = {};
    let totalIntensity = 0;

    events.forEach(event => {
      emotionDistribution[event.emotion] = (emotionDistribution[event.emotion] || 0) + 1;
      totalIntensity += event.intensity;
    });

    return {
      events,
      summary: {
        totalEvents: events.length,
        dateRange: {
          start: sortedEvents[0].timestamp,
          end: sortedEvents[sortedEvents.length - 1].timestamp
        },
        emotionDistribution,
        averageIntensity: totalIntensity / events.length
      }
    };
  };

  const handlePatternDetection = async () => {
    try {
      const success = await n8nService.triggerPatternDetection(mockEvents);
      if (success) {
        setAlert({ type: 'success', message: 'Pattern detection triggered and sent to N8N!' });
      } else {
        setAlert({ type: 'info', message: 'No significant patterns detected in recent data' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Pattern detection failed' });
    }
  };

  const handleDeployWorkflow = async (template: N8NWorkflowTemplate) => {
    try {
      const result = await n8nService.createWorkflow(template);
      if (result.success) {
        setAlert({ type: 'success', message: `Workflow "${template.name}" deployed successfully!` });
        setDeployedWorkflows(prev => [...prev, template]);
        setTemplates(prev => prev.filter(t => t.id !== template.id));
      } else {
        setAlert({ type: 'error', message: result.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to deploy workflow' });
    }
  };

  const handleRemoveWorkflow = (workflowId: string) => {
    setDeployedWorkflows(prev => prev.filter(w => w.id !== workflowId));
    setAlert({ type: 'info', message: 'Workflow removed from deployed list' });
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner message="Loading N8N Integration..." />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>N8N Integration</Title>
        <Subtitle>
          Connect your emotional data with powerful N8N workflows for automated insights, 
          notifications, and integrations.
        </Subtitle>
      </Header>

      <N8NStatus status={connectionStatus} />

      {alert && <N8NAlert type={alert.type} message={alert.message} />}

      <TabContainer>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview
        </Tab>
        <Tab active={activeTab === 'export'} onClick={() => setActiveTab('export')}>
          Data Export
        </Tab>
        <Tab active={activeTab === 'workflows'} onClick={() => setActiveTab('workflows')}>
          Workflows ({templates.length + deployedWorkflows.length})
        </Tab>
      </TabContainer>

      <TabContent>
        {activeTab === 'overview' && (
          <>
            <QuickActions>
              <ActionCard onClick={() => handleQuickAction('test')}>
                <ActionIcon>🔌</ActionIcon>
                <ActionTitle>Test Connection</ActionTitle>
                <ActionDescription>Verify N8N connectivity</ActionDescription>
              </ActionCard>

              <ActionCard onClick={() => handleQuickAction('sync')}>
                <ActionIcon>🔄</ActionIcon>
                <ActionTitle>Sync Data</ActionTitle>
                <ActionDescription>Send current data to N8N</ActionDescription>
              </ActionCard>

              <ActionCard onClick={() => handleQuickAction('patterns')}>
                <ActionIcon>🔍</ActionIcon>
                <ActionTitle>Detect Patterns</ActionTitle>
                <ActionDescription>Analyze emotional trends</ActionDescription>
              </ActionCard>

              <ActionCard onClick={() => handleQuickAction('export')}>
                <ActionIcon>📊</ActionIcon>
                <ActionTitle>Export Data</ActionTitle>
                <ActionDescription>Send data in various formats</ActionDescription>
              </ActionCard>
            </QuickActions>

            <InfoPanel>
              <InfoTitle>Integration Overview</InfoTitle>
              <InfoGrid>
                <InfoCard>
                  <InfoLabel>Total Events</InfoLabel>
                  <InfoValue>{mockEvents.length}</InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Last Sync</InfoLabel>
                  <InfoValue>
                    {n8nService.getSyncStatus().lastSync ? 
                      new Date(n8nService.getSyncStatus().lastSync).toLocaleDateString() : 
                      'Never'
                    }
                  </InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Webhooks Sent</InfoLabel>
                  <InfoValue>{n8nService.getSyncStatus().webhooksSent}</InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue style={{ 
                    color: connectionStatus === 'connected' ? '#28a745' : 
                           connectionStatus === 'error' ? '#dc3545' : '#6c757d'
                  }}>
                    {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                  </InfoValue>
                </InfoCard>
              </InfoGrid>
            </InfoPanel>
          </>
        )}

        {activeTab === 'export' && (
          <>
            <RealTimeToggle>
              <ToggleLabel>Real-time Data Streaming</ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={isRealTimeEnabled}
                  onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </RealTimeToggle>

            <ExportGrid>
              <ExportCard>
                <CardTitle>JSON Export</CardTitle>
                <CardDescription>
                  Export emotional data in JSON format for N8N workflows
                </CardDescription>
                <Button
                  $variant="primary"
                  onClick={() => handleExportToN8N('json')}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export as JSON'}
                </Button>
              </ExportCard>

              <ExportCard>
                <CardTitle>CSV Export</CardTitle>
                <CardDescription>
                  Export data in CSV format for spreadsheet analysis
                </CardDescription>
                <Button
                  $variant="primary"
                  onClick={() => handleExportToN8N('csv')}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export as CSV'}
                </Button>
              </ExportCard>

              <ExportCard>
                <CardTitle>Summary Report</CardTitle>
                <CardDescription>
                  Generate emotional wellness summary for N8N processing
                </CardDescription>
                <Button
                  $variant="primary"
                  onClick={() => handleExportToN8N('summary')}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export Summary'}
                </Button>
              </ExportCard>

              <ExportCard>
                <CardTitle>Pattern Detection</CardTitle>
                <CardDescription>
                  Trigger N8N workflow for emotional pattern analysis
                </CardDescription>
                <Button
                  $variant="secondary"
                  onClick={handlePatternDetection}
                  disabled={isExporting}
                >
                  Detect Patterns
                </Button>
              </ExportCard>
            </ExportGrid>

            {isExporting && (
              <div>
                <ProgressBar>
                  <ProgressFill progress={exportProgress} />
                </ProgressBar>
                <StatusText>Exporting data to N8N... {exportProgress}%</StatusText>
              </div>
            )}

            <InfoPanel>
              <InfoTitle>Export Statistics</InfoTitle>
              <InfoGrid>
                <InfoCard>
                  <InfoLabel>Total Events</InfoLabel>
                  <InfoValue>{mockEvents.length}</InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Avg Intensity</InfoLabel>
                  <InfoValue>
                    {mockEvents.length > 0 ? Math.round(mockEvents.reduce((sum, e) => sum + e.intensity, 0) / mockEvents.length) : 0}
                  </InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Unique Emotions</InfoLabel>
                  <InfoValue>{new Set(mockEvents.map(e => e.emotion)).size}</InfoValue>
                </InfoCard>
              </InfoGrid>
            </InfoPanel>
          </>
        )}

        {activeTab === 'workflows' && (
          <>
            <InfoTitle>Available Templates ({templates.length})</InfoTitle>
            <WorkflowGrid>
              {templates.map(template => (
                <WorkflowCard key={template.id}>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                  <WorkflowMeta>
                    <MetaTag type={template.trigger}>{template.trigger}</MetaTag>
                    <MetaTag type={template.category}>{template.category}</MetaTag>
                  </WorkflowMeta>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button $variant="primary" onClick={() => handleDeployWorkflow(template)}>
                      Deploy
                    </Button>
                    <Button $variant="secondary">Preview</Button>
                  </div>
                </WorkflowCard>
              ))}
            </WorkflowGrid>

            {deployedWorkflows.length > 0 && (
              <>
                <InfoTitle style={{ marginTop: '40px' }}>Deployed Workflows ({deployedWorkflows.length})</InfoTitle>
                <WorkflowGrid>
                  {deployedWorkflows.map(workflow => (
                    <WorkflowCard key={workflow.id}>
                      <CardTitle>{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                      <WorkflowMeta>
                        <MetaTag type={workflow.trigger}>{workflow.trigger}</MetaTag>
                        <MetaTag type={workflow.category}>{workflow.category}</MetaTag>
                      </WorkflowMeta>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button $variant="secondary" onClick={() => handleRemoveWorkflow(workflow.id)}>
                          Remove
                        </Button>
                        <Button $variant="primary">Configure</Button>
                      </div>
                    </WorkflowCard>
                  ))}
                </WorkflowGrid>
              </>
            )}
          </>
        )}
      </TabContent>
    </Container>
  );
};

export default N8NIntegration;
