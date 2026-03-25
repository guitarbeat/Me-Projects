import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { EmotionalEvent } from '../../types/emotion-log';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from '../common';
import EmotionAnalytics from './EmotionAnalytics';
import EmotionTracker from './EmotionTracker';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  padding: 20px 0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 0 20px;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #ccc;
  font-size: 1.2rem;
  margin: 0 0 24px 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  background: #2a2a2a;
  border-radius: 12px;
  padding: 4px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${({ active }) => active ? '#4ECDC4' : 'transparent'};
  color: ${({ active }) => active ? '#1a1a1a' : '#fff'};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: ${({ active }) => active ? '#45b7b8' : '#444'};
  }
  
  &:focus {
    outline: 2px solid #4ECDC4;
    outline-offset: 2px;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
`;

const TabContent = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  text-align: center;
  background: linear-gradient(135deg, #2a2a2a 0%, #333 100%);
  border: 1px solid #555;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
`;

const StatValue = styled.div`
  color: #4ECDC4;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #999;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatTrend = styled.div<{ trend: 'up' | 'down' | 'stable' }>`
  color: ${({ trend }) => {
    switch (trend) {
      case 'up': return '#2ed573';
      case 'down': return '#ff6b6b';
      default: return '#ffa502';
    }
  }};
  font-size: 0.8rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #333 100%);
  border: 1px solid #555;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    border-color: #4ECDC4;
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.8;
`;

const FeatureTitle = styled.h3`
  color: #fff;
  margin: 0 0 12px 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: #ccc;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 24px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  color: #ccc;
  margin: 0 0 24px 0;
  line-height: 1.5;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

type TabType = 'tracker' | 'insights' | 'advanced' | 'performance';

interface EmotionTrackingDashboardProps {
  events: EmotionalEvent[];
  onEmotionLog: (emotion: string, intensity: number) => void;
}

const EmotionTrackingDashboard: React.FC<EmotionTrackingDashboardProps> = ({
  events,
  onEmotionLog
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tracker');

  // Calculate quick stats
  const quickStats = useMemo(() => {
    const totalEvents = events.length;
    const averageIntensity = totalEvents > 0 
      ? events.reduce((sum, e) => sum + e.intensity, 0) / totalEvents 
      : 0;
    
    const uniqueEmotions = new Set(events.map(e => e.emotion)).size;
    
    // Calculate trend (last 7 days vs previous 7 days)
    const now = new Date();
    const lastWeek = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    });
    
    const previousWeek = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) &&
             eventDate < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    });
    
    const lastWeekAvg = lastWeek.length > 0 
      ? lastWeek.reduce((sum, e) => sum + e.intensity, 0) / lastWeek.length 
      : 0;
    const previousWeekAvg = previousWeek.length > 0 
      ? previousWeek.reduce((sum, e) => sum + e.intensity, 0) / previousWeek.length 
      : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(lastWeekAvg - previousWeekAvg) > 0.5) {
      trend = lastWeekAvg > previousWeekAvg ? 'up' : 'down';
    }
    
    return {
      totalEvents,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      uniqueEmotions,
      trend,
      trendValue: Math.abs(lastWeekAvg - previousWeekAvg)
    };
  }, [events]);

  const tabs = [
    { id: 'tracker' as TabType, label: 'Basic Tracker', icon: '🎭' },
    { id: 'insights' as TabType, label: 'Insights', icon: '🧠' },
    { id: 'advanced' as TabType, label: 'Advanced', icon: '⚡' },
    { id: 'performance' as TabType, label: 'Performance', icon: '📊' },
  ];

  const features = [
    {
      icon: '📈',
      title: 'Emotion Analytics',
      description: 'Deep insights into your emotional patterns, trends, and correlations over time.',
      action: () => setActiveTab('insights')
    },
    {
      icon: '🤖',
      title: 'AI-Powered Insights',
      description: 'Advanced pattern detection and personalized recommendations based on your data.',
      action: () => setActiveTab('advanced')
    },
    {
      icon: '⚡',
      title: 'Performance Tracking',
      description: 'Monitor app performance and optimize your emotion tracking experience.',
      action: () => setActiveTab('performance')
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description: 'Responsive design that works perfectly on all devices and screen sizes.',
      action: () => setActiveTab('tracker')
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <EmotionTracker
            onEmotionLog={onEmotionLog}
            events={events}
            showPerformanceMetrics={false}
          />
        );
      case 'insights':
        return <EmotionAnalytics events={events} />;
      case 'advanced':
        return <EmotionAnalytics events={events} />;
      case 'performance':
        return (
          <EmotionTracker
            onEmotionLog={onEmotionLog}
            events={events}
            showPerformanceMetrics={true}
          />
        );
      default:
        return null;
    }
  };

  if (events.length === 0) {
    return (
      <DashboardContainer>
        <ResponsiveContainer>
          <EmptyState>
            <EmptyIcon>🎭</EmptyIcon>
            <EmptyTitle>Start Your Emotion Journey</EmptyTitle>
            <EmptyDescription>
              Begin tracking your emotions to unlock personalized insights, patterns, and recommendations. 
              Your emotional wellness journey starts with a single click.
            </EmptyDescription>
            <Button 
              variant="default" 
              size="lg"
              onClick={() => setActiveTab('tracker')}
            >
              Start Tracking
            </Button>
          </EmptyState>
        </ResponsiveContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <ResponsiveContainer>
        <Header>
          <Title>Emotion Tracking Dashboard</Title>
          <Subtitle>Understand your emotions, improve your wellbeing</Subtitle>
        </Header>

        <QuickStats>
          <StatCard>
            <StatValue>{quickStats.totalEvents}</StatValue>
            <StatLabel>Total Events</StatLabel>
            <StatTrend trend={quickStats.trend}>
              {quickStats.trend === 'up' ? '📈' : quickStats.trend === 'down' ? '📉' : '➡️'} 
              {quickStats.trendValue.toFixed(1)}
            </StatTrend>
          </StatCard>
          
          <StatCard>
            <StatValue>{quickStats.averageIntensity}</StatValue>
            <StatLabel>Avg Intensity</StatLabel>
            <StatTrend trend="stable">
              ⚡ Out of 10
            </StatTrend>
          </StatCard>
          
          <StatCard>
            <StatValue>{quickStats.uniqueEmotions}</StatValue>
            <StatLabel>Unique Emotions</StatLabel>
            <StatTrend trend="stable">
              🎭 Different Types
            </StatTrend>
          </StatCard>
        </QuickStats>

        <TabContainer>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </Tab>
          ))}
        </TabContainer>

        <TabContent>
          {renderTabContent()}
        </TabContent>

        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index} onClick={feature.action}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <Button variant="secondary" className="w-full">
                Explore Feature
              </Button>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </ResponsiveContainer>
    </DashboardContainer>
  );
};

export default EmotionTrackingDashboard;