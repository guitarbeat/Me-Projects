import React from 'react';
import styled from 'styled-components';

const Card = styled.div<{ severity: string }>`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return '#ff4757';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#444';
    }
  }};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const Name = styled.h4`
  color: #fff;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const Badge = styled.div<{ confidence: number }>`
  background: ${props => {
    if (props.confidence >= 0.8) return '#2ed573';
    if (props.confidence >= 0.6) return '#ffa502';
    return '#ff6b6b';
  }};
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const Description = styled.p`
  color: #ccc;
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  color: #4ECDC4;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  color: #999;
  font-size: 0.8rem;
`;

const InsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InsightItem = styled.li`
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
  
  &:before {
    content: '💡';
    position: absolute;
    left: 0;
    top: 0;
  }
`;

interface PatternCardProps {
  name: string;
  description: string;
  severity: string;
  confidence: number;
  metrics: {
    frequency: number;
    intensity: number;
    duration: number;
  };
  insights: string[];
}

export const PatternCard: React.FC<PatternCardProps> = ({
  name,
  description,
  severity,
  confidence,
  metrics,
  insights
}) => {
  return (
    <Card severity={severity}>
      <Header>
        <Name>{name}</Name>
        <Badge confidence={confidence}>
          {Math.round(confidence * 100)}% confidence
        </Badge>
      </Header>
      <Description>{description}</Description>
      <MetricsGrid>
        <Metric>
          <MetricValue>{metrics.frequency.toFixed(1)}</MetricValue>
          <MetricLabel>per day</MetricLabel>
        </Metric>
        <Metric>
          <MetricValue>{metrics.intensity.toFixed(1)}</MetricValue>
          <MetricLabel>avg intensity</MetricLabel>
        </Metric>
        <Metric>
          <MetricValue>{metrics.duration}</MetricValue>
          <MetricLabel>days</MetricLabel>
        </Metric>
      </MetricsGrid>
      <InsightsList>
        {insights.map((insight, index) => (
          <InsightItem key={index}>{insight}</InsightItem>
        ))}
      </InsightsList>
    </Card>
  );
};
