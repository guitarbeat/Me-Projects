import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { EmotionalEvent } from '../../types/emotion-log';
import { EmotionalPattern, EmotionalInsight } from '../../services/n8nAdvancedService';
import n8nAdvancedService from '../../services/n8nAdvancedService';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid } from '../common';
import { PatternCard } from './shared/PatternCard';
import { EmotionTrend, WeeklyPattern, getEmotionColor } from './shared/types';

const Container = styled.div`
  padding: 24px;
  margin: 20px 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid #444;
`;

const Title = styled.h2`
  color: #fff;
  margin: 0 0 24px 0;
  font-size: 1.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  font-weight: 500;
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const InsightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const InsightCard = styled.div<{ priority: string }>`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#444';
    }
  }};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const InsightHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const InsightTitle = styled.h4`
  color: #fff;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const PriorityBadge = styled.div<{ priority: string }>`
  background: ${props => {
    switch (props.priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#444';
    }
  }};
  color: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
`;

const InsightDescription = styled.p`
  color: #ccc;
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: #4ECDC4;
  color: #1a1a1a;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #45b7b8;
  }
  
  &:focus {
    outline: 2px solid #4ECDC4;
    outline-offset: 2px;
  }
`;

const RefreshButton = styled.button`
  background: #4ECDC4;
  color: #1a1a1a;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
  
  &:hover {
    background: #45b7b8;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #444;
  border-radius: 50%;
  border-top-color: #4ECDC4;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
`;

const TrendIndicator = styled.div<{ trend: 'up' | 'down' | 'stable' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ trend }) => {
    switch (trend) {
      case 'up': return '#2ed573';
      case 'down': return '#ff6b6b';
      default: return '#ffa502';
    }
  }};
`;

const ChartContainer = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  border: 1px solid #333;
`;

const ChartTitle = styled.h4`
  color: #fff;
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 500;
`;

const SimpleChart = styled.div`
  display: flex;
  align-items: end;
  gap: 4px;
  height: 100px;
  margin: 16px 0;
`;

const ChartBar = styled.div<{ height: number; color: string }>`
  background: ${({ color }) => color};
  height: ${({ height }) => height}%;
  min-height: 4px;
  border-radius: 2px;
  flex: 1;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0;
`;

const RecommendationItem = styled.li`
  color: #ccc;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  
  &:before {
    content: '💡';
    position: absolute;
    left: 0;
    top: 0;
  }
`;

interface EmotionAnalyticsProps {
  events: EmotionalEvent[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const EmotionAnalytics: React.FC<EmotionAnalyticsProps> = ({ 
  events, 
  timeRange = 'month' 
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [patterns, setPatterns] = useState<EmotionalPattern[]>([]);
  const [insights, setInsights] = useState<EmotionalInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { handleAsyncError } = useErrorHandler({
    component: 'EmotionAnalytics'
  });

  // Filter events based on time range
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (selectedTimeRange) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return events.filter(event => new Date(event.timestamp) >= cutoff);
  }, [events, selectedTimeRange]);

  // Calculate emotion trends
  const emotionTrends = useMemo((): EmotionTrend[] => {
    const emotionMap = new Map<string, { count: number; totalIntensity: number; intensities: number[] }>();
    
    filteredEvents.forEach(event => {
      const existing = emotionMap.get(event.emotion) || { count: 0, totalIntensity: 0, intensities: [] };
      emotionMap.set(event.emotion, {
        count: existing.count + 1,
        totalIntensity: existing.totalIntensity + event.intensity,
        intensities: [...existing.intensities, event.intensity]
      });
    });

    return Array.from(emotionMap.entries()).map(([emotion, data]) => {
      const averageIntensity = data.totalIntensity / data.count;
      
      // Calculate trend (simplified - compare first half vs second half)
      const half = Math.floor(data.intensities.length / 2);
      const firstHalf = data.intensities.slice(0, half);
      const secondHalf = data.intensities.slice(half);
      
      const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, i) => sum + i, 0) / firstHalf.length : 0;
      const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, i) => sum + i, 0) / secondHalf.length : 0;
      
      const change = secondHalfAvg - firstHalfAvg;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (Math.abs(change) > 0.5) {
        trend = change > 0 ? 'up' : 'down';
      }
      
      return {
        emotion,
        count: data.count,
        averageIntensity,
        trend,
        change: Math.abs(change)
      };
    }).sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  // Calculate weekly patterns
  const weeklyPatterns = useMemo((): WeeklyPattern[] => {
    const dayMap = new Map<string, { totalIntensity: number; count: number; emotions: string[] }>();
    
    filteredEvents.forEach(event => {
      const day = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      const existing = dayMap.get(day) || { totalIntensity: 0, count: 0, emotions: [] };
      dayMap.set(day, {
        totalIntensity: existing.totalIntensity + event.intensity,
        count: existing.count + 1,
        emotions: [...existing.emotions, event.emotion]
      });
    });

    return Array.from(dayMap.entries()).map(([day, data]) => {
      const averageIntensity = data.totalIntensity / data.count;
      
      // Find dominant emotion for this day
      const emotionCounts = data.emotions.reduce((counts, emotion) => {
        counts[emotion] = (counts[emotion] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      const dominantEmotion = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral';
      
      return {
        day,
        averageIntensity,
        dominantEmotion,
        count: data.count
      };
    }).sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });
  }, [filteredEvents]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs: string[] = [];
    
    if (emotionTrends.length === 0) return recs;
    
    const totalEvents = filteredEvents.length;
    const averageIntensity = filteredEvents.reduce((sum, e) => sum + e.intensity, 0) / totalEvents;
    
    // High intensity recommendation
    if (averageIntensity >= 7) {
      recs.push('Your emotions have been quite intense lately. Consider practicing mindfulness or stress management techniques.');
    }
    
    // Negative emotion trend
    const negativeEmotions = emotionTrends.filter(trend => 
      ['sad', 'angry', 'anxious', 'stressed', 'frustrated'].includes(trend.emotion.toLowerCase())
    );
    
    if (negativeEmotions.length > 0) {
      const negativeCount = negativeEmotions.reduce((sum, trend) => sum + trend.count, 0);
      if (negativeCount / totalEvents > 0.6) {
        recs.push('You\'ve been experiencing more negative emotions recently. Consider reaching out to friends, family, or a mental health professional.');
      }
    }
    
    // Low activity recommendation
    if (totalEvents < 5) {
      recs.push('You haven\'t been tracking your emotions much lately. Regular tracking can help you understand your emotional patterns better.');
    }
    
    // Weekly pattern recommendation
    const weekendDays = weeklyPatterns.filter(p => ['Saturday', 'Sunday'].includes(p.day));
    const weekdayDays = weeklyPatterns.filter(p => !['Saturday', 'Sunday'].includes(p.day));
    
    if (weekendDays.length > 0 && weekdayDays.length > 0) {
      const weekendAvg = weekendDays.reduce((sum, d) => sum + d.averageIntensity, 0) / weekendDays.length;
      const weekdayAvg = weekdayDays.reduce((sum, d) => sum + d.averageIntensity, 0) / weekdayDays.length;
      
      if (Math.abs(weekendAvg - weekdayAvg) > 2) {
        recs.push('Your emotional patterns differ significantly between weekdays and weekends. Consider what factors might be causing this difference.');
      }
    }
    
    return recs;
  }, [emotionTrends, filteredEvents, weeklyPatterns]);

  const loadPatterns = useCallback(async () => {
    try {
      setIsLoading(true);
      const detectedPatterns = await handleAsyncError(
        () => n8nAdvancedService.detectPatterns(),
        [],
        { action: 'loadPatterns' }
      );
      setPatterns(detectedPatterns || []);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleAsyncError]);

  const loadInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      const generatedInsights = await handleAsyncError(
        () => n8nAdvancedService.generateInsights(),
        [],
        { action: 'loadInsights' }
      );
      setInsights(generatedInsights || []);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleAsyncError]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadPatterns(), loadInsights()]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadPatterns, loadInsights]);

  const handleInsightAction = useCallback((action: () => void) => {
    try {
      action();
    } catch (error) {
      console.error('Failed to execute insight action:', error);
    }
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  React.useEffect(() => {
    if (events.length > 0) {
      handleRefresh();
    }
  }, [events.length, handleRefresh]);

  return (
    <Container>
      <Title>
        🧠 Emotion Analytics & Insights
        {isLoading && <LoadingSpinner />}
      </Title>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ color: '#fff' }}>Time Range:</label>
        <select 
          value={selectedTimeRange} 
          onChange={(e) => setSelectedTimeRange(e.target.value as any)}
          style={{
            background: '#2a2a2a',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '6px',
            padding: '8px 12px'
          }}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
        
        <RefreshButton onClick={handleRefresh} disabled={isLoading} style={{ marginBottom: 0, marginLeft: 'auto' }}>
          {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
        </RefreshButton>
      </div>

      {lastUpdated && (
        <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '24px' }}>
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      <Grid columns={{ xs: 1, md: 2, lg: 3 }} gap="medium">
        <Card>
          <CardContent className="pt-6">
            <InsightTitle>📊 Total Events</InsightTitle>
            <StatValue>{filteredEvents.length}</StatValue>
            <StatLabel>Emotions Logged</StatLabel>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <InsightTitle>⚡ Average Intensity</InsightTitle>
            <StatValue>
              {filteredEvents.length > 0 
                ? (filteredEvents.reduce((sum, e) => sum + e.intensity, 0) / filteredEvents.length).toFixed(1)
                : '0'
              }
            </StatValue>
            <StatLabel>Out of 10</StatLabel>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <InsightTitle>🎭 Unique Emotions</InsightTitle>
            <StatValue>{new Set(filteredEvents.map(e => e.emotion)).size}</StatValue>
            <StatLabel>Different Types</StatLabel>
          </CardContent>
        </Card>
      </Grid>

      <Section>
        <SectionTitle>Top Emotions</SectionTitle>
        <Card>
          <CardContent className="pt-6">
            {emotionTrends.slice(0, 5).map((trend, index) => (
              <div key={trend.emotion} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontWeight: '500' }}>
                    {index + 1}. {trend.emotion}
                  </span>
                  <TrendIndicator trend={trend.trend}>
                    {getTrendIcon(trend.trend)} {trend.count}
                  </TrendIndicator>
                </div>
                <div style={{ 
                  background: '#1a1a1a', 
                  height: '8px', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: getEmotionColor(trend.emotion),
                    height: '100%',
                    width: `${(trend.count / Math.max(...emotionTrends.map(t => t.count))) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <Section>
        <SectionTitle>Weekly Patterns</SectionTitle>
        <Card>
          <CardContent className="pt-6">
            <ChartContainer>
              <ChartTitle>Average Intensity by Day</ChartTitle>
              <SimpleChart>
                {weeklyPatterns.map((pattern) => (
                  <ChartBar
                    key={pattern.day}
                    height={(pattern.averageIntensity / 10) * 100}
                    color={getEmotionColor(pattern.dominantEmotion)}
                    title={`${pattern.day}: ${pattern.averageIntensity.toFixed(1)} intensity`}
                  />
                ))}
              </SimpleChart>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#999' }}>
                {weeklyPatterns.map(pattern => (
                  <span key={pattern.day}>{pattern.day.slice(0, 3)}</span>
                ))}
              </div>
            </ChartContainer>
          </CardContent>
        </Card>
      </Section>

      <Section>
        <SectionTitle>Detected Patterns</SectionTitle>
        {patterns.length === 0 ? (
          <EmptyState>
            No patterns detected yet. Add more emotional events to enable pattern detection.
          </EmptyState>
        ) : (
          <PatternGrid>
            {patterns.map(pattern => (
              <PatternCard
                key={pattern.id}
                name={pattern.name}
                description={pattern.description}
                severity={pattern.severity}
                confidence={pattern.confidence}
                metrics={pattern.data.metrics}
                insights={pattern.data.insights}
              />
            ))}
          </PatternGrid>
        )}
      </Section>

      <Section>
        <SectionTitle>Personalized Insights</SectionTitle>
        {insights.length === 0 ? (
          <EmptyState>
            No insights available yet. Continue tracking your emotions to receive personalized insights.
          </EmptyState>
        ) : (
          <InsightGrid>
            {insights.map(insight => (
              <InsightCard key={insight.id} priority={insight.priority}>
                <InsightHeader>
                  <InsightTitle>{insight.title}</InsightTitle>
                  <PriorityBadge priority={insight.priority}>
                    {insight.priority}
                  </PriorityBadge>
                </InsightHeader>
                <InsightDescription>{insight.description}</InsightDescription>
                {insight.actionable && insight.actions && (
                  <ActionButtons>
                    {insight.actions.map((action, index) => (
                      <ActionButton
                        key={index}
                        onClick={() => handleInsightAction(action.handler)}
                      >
                        {action.label}
                      </ActionButton>
                    ))}
                  </ActionButtons>
                )}
              </InsightCard>
            ))}
          </InsightGrid>
        )}
      </Section>

      {recommendations.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <InsightTitle>💡 Personalized Recommendations</InsightTitle>
            <InsightDescription>Based on your emotional patterns, here are some suggestions:</InsightDescription>
            
            <RecommendationList>
              {recommendations.map((rec, index) => (
                <RecommendationItem key={index}>{rec}</RecommendationItem>
              ))}
            </RecommendationList>
            
            <Button variant="secondary" className="w-full mt-4">
              View Detailed Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

const StatValue = styled.div`
  color: #4ECDC4;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #999;
  font-size: 0.9rem;
`;

export default EmotionAnalytics;
