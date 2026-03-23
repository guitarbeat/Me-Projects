import React from 'react';
import styled from 'styled-components';
import {
  H1, H2, H3, H4, H5, H6,
  BodyLarge, Body, BodySmall, Caption,
  Display, Lead, Code, Link,
  TextMuted, TextAccent, TextSuccess, TextError, TextWarning,
  List, OrderedList, Blockquote
} from './Typography';

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  min-height: 100vh;
  color: #ffffff;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  color: #60a5fa;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid rgba(96, 165, 250, 0.3);
  padding-bottom: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
`;

const Example = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ExampleLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const TypographyDemo: React.FC = () => {
  return (
    <DemoContainer>
      <Display>Typography System</Display>
      <Lead>
        A comprehensive typography system built with modern design principles, 
        featuring consistent spacing, improved readability, and beautiful typefaces.
      </Lead>

      {/* Headings Section */}
      <Section>
        <SectionTitle>Headings</SectionTitle>
        <Grid>
          <Example>
            <ExampleLabel>H1 - Display Heading</ExampleLabel>
            <H1>This is a large heading</H1>
          </Example>
          <Example>
            <ExampleLabel>H2 - Section Heading</ExampleLabel>
            <H2>This is a section heading</H2>
          </Example>
          <Example>
            <ExampleLabel>H3 - Subsection Heading</ExampleLabel>
            <H3>This is a subsection heading</H3>
          </Example>
          <Example>
            <ExampleLabel>H4 - Card Heading</ExampleLabel>
            <H4>This is a card heading</H4>
          </Example>
          <Example>
            <ExampleLabel>H5 - Small Heading</ExampleLabel>
            <H5>This is a small heading</H5>
          </Example>
          <Example>
            <ExampleLabel>H6 - Tiny Heading</ExampleLabel>
            <H6>This is a tiny heading</H6>
          </Example>
        </Grid>
      </Section>

      {/* Body Text Section */}
      <Section>
        <SectionTitle>Body Text</SectionTitle>
        <Grid>
          <Example>
            <ExampleLabel>Body Large</ExampleLabel>
            <BodyLarge>
              This is body large text, perfect for lead paragraphs and important content. 
              It provides excellent readability with comfortable line spacing.
            </BodyLarge>
          </Example>
          <Example>
            <ExampleLabel>Body (Default)</ExampleLabel>
            <Body>
              This is the default body text, used for most content throughout the application. 
              It's optimized for readability and comfortable reading experience.
            </Body>
          </Example>
          <Example>
            <ExampleLabel>Body Small</ExampleLabel>
            <BodySmall>
              This is smaller body text, ideal for captions, metadata, and secondary information. 
              It maintains readability while being more compact.
            </BodySmall>
          </Example>
          <Example>
            <ExampleLabel>Caption</ExampleLabel>
            <Caption>This is a caption text</Caption>
          </Example>
        </Grid>
      </Section>

      {/* Special Text Section */}
      <Section>
        <SectionTitle>Special Text Styles</SectionTitle>
        <Grid>
          <Example>
            <ExampleLabel>Display Text</ExampleLabel>
            <Display>Display</Display>
          </Example>
          <Example>
            <ExampleLabel>Lead Paragraph</ExampleLabel>
            <Lead>
              This is a lead paragraph that introduces the main content. 
              It's larger and more prominent than regular body text.
            </Lead>
          </Example>
          <Example>
            <ExampleLabel>Code</ExampleLabel>
            <Code>const example = "This is inline code";</Code>
          </Example>
          <Example>
            <ExampleLabel>Link</ExampleLabel>
            <Link href="#">This is a link example</Link>
          </Example>
        </Grid>
      </Section>

      {/* Utility Text Section */}
      <Section>
        <SectionTitle>Utility Text Colors</SectionTitle>
        <Grid>
          <Example>
            <ExampleLabel>Muted Text</ExampleLabel>
            <TextMuted>This text is muted for secondary information</TextMuted>
          </Example>
          <Example>
            <ExampleLabel>Accent Text</ExampleLabel>
            <TextAccent>This text has an accent color</TextAccent>
          </Example>
          <Example>
            <ExampleLabel>Success Text</ExampleLabel>
            <TextSuccess>This text indicates success</TextSuccess>
          </Example>
          <Example>
            <ExampleLabel>Error Text</ExampleLabel>
            <TextError>This text indicates an error</TextError>
          </Example>
          <Example>
            <ExampleLabel>Warning Text</ExampleLabel>
            <TextWarning>This text indicates a warning</TextWarning>
          </Example>
        </Grid>
      </Section>

      {/* Lists Section */}
      <Section>
        <SectionTitle>Lists</SectionTitle>
        <Grid>
          <Example>
            <ExampleLabel>Unordered List</ExampleLabel>
            <List>
              <li>First item in the list</li>
              <li>Second item with more content to show line wrapping</li>
              <li>Third item</li>
            </List>
          </Example>
          <Example>
            <ExampleLabel>Ordered List</ExampleLabel>
            <OrderedList>
              <li>Step one of the process</li>
              <li>Step two with additional details</li>
              <li>Final step</li>
            </OrderedList>
          </Example>
        </Grid>
      </Section>

      {/* Blockquote Section */}
      <Section>
        <SectionTitle>Blockquotes</SectionTitle>
        <Grid>
          <Example>
            <ExampleLabel>Blockquote</ExampleLabel>
            <Blockquote>
              This is a beautiful blockquote that demonstrates the typography system's 
              ability to handle longer text content with proper styling and spacing.
            </Blockquote>
          </Example>
        </Grid>
      </Section>

      {/* Code Block Section */}
      <Section>
        <SectionTitle>Code Blocks</SectionTitle>
        <Grid>
          <Example>
            <ExampleLabel>Code Block</ExampleLabel>
            <pre>
              <code>{`function example() {
  const message = "Hello, Typography!";
  console.log(message);
  return message;
}`}</code>
            </pre>
          </Example>
        </Grid>
      </Section>

      {/* Responsive Demo */}
      <Section>
        <SectionTitle>Responsive Typography</SectionTitle>
        <Body>
          This section demonstrates how the typography system adapts to different screen sizes. 
          Try resizing your browser window to see the responsive behavior in action.
        </Body>
        <Grid>
          <Example>
            <ExampleLabel>Large Screen (Desktop)</ExampleLabel>
            <H1>Responsive Heading</H1>
            <Body>This text will be larger on desktop devices</Body>
          </Example>
          <Example>
            <ExampleLabel>Medium Screen (Tablet)</ExampleLabel>
            <H2>Responsive Heading</H2>
            <BodySmall>This text adapts to tablet screens</BodySmall>
          </Example>
        </Grid>
      </Section>
    </DemoContainer>
  );
};

export default TypographyDemo;