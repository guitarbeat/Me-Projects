import React, { useState } from 'react';
import styled from 'styled-components';
import N8NIntegration from './N8NIntegration';

const DemoContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  padding: 20px;
`;

const DemoHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
`;

const DemoTitle = styled.h1`
  color: #fff;
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #00d4ff, #007acc, #6f42c1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DemoSubtitle = styled.p`
  color: #ccc;
  font-size: 1.2rem;
  margin: 0 0 30px 0;
  max-width: 800px;
  margin: 0 auto 30px auto;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  max-width: 1200px;
  margin: 0 auto 40px auto;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  text-align: center;
`;

const FeatureTitle = styled.h3`
  color: #fff;
  margin: 0 0 12px 0;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
`;

const FeatureDescription = styled.p`
  color: #ccc;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: center;
`;

const DemoButton = styled.button`
  background: linear-gradient(135deg, #007acc, #00d4ff);
  color: #fff;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 122, 204, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const N8NDemo: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <N8NIntegration />;
  }

  return (
    <DemoContainer>
      <DemoHeader>
        <DemoTitle>N8N + Tampana Integration</DemoTitle>
        <DemoSubtitle>
          Transform your emotional wellness journey with the power of automated workflows. 
          Connect your Tampana emotion tracking data with N8N to create intelligent, 
          personalized wellness experiences that adapt to your emotional patterns.
        </DemoSubtitle>
        
        <ButtonContainer>
          <DemoButton onClick={() => setShowDashboard(true)}>
            🚀 Launch N8N Dashboard
          </DemoButton>
          <DemoButton onClick={() => window.open('https://n8n.alw.lol', '_blank')}>
            🔗 Open N8N Instance
          </DemoButton>
        </ButtonContainer>
      </DemoHeader>

      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>🧠</FeatureIcon>
          <FeatureTitle>Intelligent Pattern Detection</FeatureTitle>
          <FeatureDescription>
            Automatically identify emotional trends and patterns using advanced algorithms. 
            Get early warnings for concerning emotional states and proactive wellness recommendations.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>⚡</FeatureIcon>
          <FeatureTitle>Real-time Automation</FeatureTitle>
          <FeatureDescription>
            Trigger N8N workflows instantly when emotions are logged. Create responsive, 
            adaptive wellness systems that react to your emotional state in real-time.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🔗</FeatureIcon>
          <FeatureTitle>Seamless Integrations</FeatureTitle>
          <FeatureDescription>
            Connect with your favorite tools and services. Send notifications to Slack, 
            schedule activities in Google Calendar, or integrate with health platforms.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>Advanced Analytics</FeatureTitle>
          <FeatureDescription>
            Generate comprehensive reports and insights. Track your emotional wellness 
            journey with detailed analytics and progress monitoring.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🛡️</FeatureIcon>
          <FeatureTitle>Privacy First</FeatureTitle>
          <FeatureDescription>
            Your emotional data stays local and secure. All transmissions to N8N are 
            encrypted and you maintain full control over your data.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🎯</FeatureIcon>
          <FeatureTitle>Personalized Wellness</FeatureTitle>
          <FeatureDescription>
            Create custom wellness workflows tailored to your needs. From daily check-ins 
            to crisis intervention, build the perfect emotional support system.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>

      <div style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
        <p>Ready to automate your emotional wellness? Click "Launch N8N Dashboard" to get started!</p>
        <p style={{ marginTop: '8px' }}>
          Your N8N instance at <strong>n8n.alw.lol</strong> will receive webhook data from Tampana.
        </p>
      </div>
    </DemoContainer>
  );
};

export default N8NDemo;