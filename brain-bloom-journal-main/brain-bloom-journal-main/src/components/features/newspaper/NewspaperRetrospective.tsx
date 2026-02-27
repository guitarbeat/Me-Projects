import { memo, useMemo, useCallback, useState, useRef, useEffect } from "react";
import { NewspaperHeader } from "./NewspaperHeader";
import { MainArticle } from "./MainArticle";
import { SidebarHighlights } from "./primitives/SidebarHighlights";
import { SectionHeader } from "./SectionHeader";
import { ArticleGrid } from "./ArticleGrid";
import { QuoteBox } from "./QuoteBox";
import { EmptyNewspaperState } from "./EmptyNewspaperState";
import { NewspaperActions } from "./NewspaperActions";
import { generateNewspaperContent } from "./content-generator";
import { Button, NewsprintCard, NewsprintCardHeader, NewsprintCardTitle, NewsprintCardContent, NewsprintTextarea } from "@/components/ui";
import { Share, Printer as Print } from "@/lib/icons/icon-imports";
import { formatDate, formatShortDate, newsprintTextStyles, newsprintLayoutStyles } from "@/lib";
import { useShareActions, useDebounce } from "@/hooks";
import type { NewspaperRetrospectiveProps, Message, NewspaperContent } from "./types";

// Optimized component to prevent re-renders of all inputs when one changes
const EditableReflectionItem = memo(( {
  id,
  text,
  placeholder,
  className,
  onUpdate
}: {
  id: string,
  text: string,
  placeholder: string,
  className?: string,
  onUpdate: (id: string, text: string) => void
} ) => {
  const handleChange = useCallback(( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
    onUpdate( id, e.target.value );
  }, [ id, onUpdate ]);

  return (
    <NewsprintTextarea
      value={text}
      onChange={handleChange}
      className={`w-full ${className || ''}`}
      placeholder={placeholder}
    />
  );
});

EditableReflectionItem.displayName = 'EditableReflectionItem';

const NOOP = () => {};

export const NewspaperRetrospective = memo<NewspaperRetrospectiveProps>(( {
  messages,
  structuredData,
  className = '',
  isMobile = false,
  isEditing = false,
  isSaving = false,
  onSaveEdit
} ) => {
  const [ editableMessages, setEditableMessages ] = useState<Message[]>( [] );
  const editableMessagesRef = useRef( editableMessages );
  const printRef = useRef<HTMLDivElement>( null );

  // Initialize editable messages when editing mode starts
  useEffect(() => {
    if (isEditing) {
      setEditableMessages(messages.map(message => ({ ...message })));
      return;
    }

    setEditableMessages([]);
  }, [isEditing, messages]);

  // Keep ref in sync with state for stable callbacks
  useEffect(() => {
    editableMessagesRef.current = editableMessages;
  }, [editableMessages]);

  // Filter out AI messages to focus on user thoughts
  const userMessages = useMemo(
    () => (isEditing ? editableMessages : messages).filter(msg => msg.isUser),
    [isEditing, editableMessages, messages]
  );

  const hasUserMessages = userMessages.length > 0;

  // Memoized save handler that uses ref to avoid re-renders during typing
  const handleSave = useCallback(() => {
    if (onSaveEdit && editableMessagesRef.current.length > 0) {
      onSaveEdit(editableMessagesRef.current);
    }
  }, [onSaveEdit]);

  const updateMessageById = useCallback((id: string, newText: string) => {
    setEditableMessages(prev => {
      const index = prev.findIndex(msg => msg.id === id);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  }, []);

  const { handleShare, handlePrint } = useShareActions({
    title: 'My Daily Reflection',
    text: 'Check out my journal reflection'
  });

  // Debounce user messages to prevent expensive content regeneration on every keystroke
  const debouncedUserMessages = useDebounce(userMessages, 300);

  // Generate newspaper content
  const content = useMemo(() => {
    if (!debouncedUserMessages.length) {
      // Return empty structure to prevent crash during initial render or empty state
      return {
        mainHeadline: '',
        weekRange: '',
        longestMessage: { text: '' } as Message,
        highlights: [],
        articles: [],
        quote: { text: '', author: '' }
      } as unknown as NewspaperContent;
    }
    return generateNewspaperContent(debouncedUserMessages, structuredData);
  }, [debouncedUserMessages, structuredData]);

  const currentDate = useMemo(() => formatDate(new Date()), []);

  const volumeIssue = useMemo(() => `Volume 1, Issue ${Math.floor(Math.random() * 50) + 1}`, []);

  const additionalContent = useMemo(() => {
    // Use debounced messages to prevent unnecessary recalculation on every keystroke
    const sourceMessages = debouncedUserMessages;

    if (sourceMessages.length > 1) {
      return sourceMessages.slice(1, 3).map(msg => msg.text).join(' ').substring(0, 300).replace(/[<>]/g, '') + "...";
    }
    return "This week's journey of self-discovery continues to reveal new insights about personal growth and the importance of taking time for reflection. Each thought shared contributes to a deeper understanding of life's complexities and joys.";
  }, [debouncedUserMessages]);

  if (!hasUserMessages) {
    return <EmptyNewspaperState isMobile={isMobile} />;
  }

  return (
    <div className={`min-h-screen bg-newsprint-bg newsprint-dot-grid font-newsprint-sans ${className}`} ref={printRef}>
      <div className={`${newsprintLayoutStyles.container} py-4 md:py-8`}>

        {/* Actions Bar */}
        <NewspaperActions
          isMobile={isMobile}
          isEditing={isEditing}
          isSaving={isSaving}
          onShare={handleShare}
          onPrint={handlePrint}
          onSave={handleSave}
          onCancel={NOOP}
          canEdit={!!onSaveEdit}
        />

        {/* Newspaper Header */}
        {!isMobile && (
          <NewspaperHeader
            title="THE MINDFUL CHRONICLE"
            tagline="Your Personal Journey in Review"
            weekRange={content.weekRange}
            volumeIssue={volumeIssue}
          />
        )}

        {/* Main Content Grid */}
        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-4 gap-0'} mb-12`}>
          <div className={isMobile ? '' : 'lg:col-span-3 border-r border-newsprint-border pr-8'}>
            {isEditing ? (
              <NewsprintCard variant="default">
                <NewsprintCardHeader>
                  <NewsprintCardTitle className="text-2xl lg:text-3xl mb-4">
                    {content.mainHeadline}
                  </NewsprintCardTitle>
                  <div className={newsprintTextStyles.metadata + " mb-4"}>
                    By [Your Name] | {currentDate}
                  </div>
                </NewsprintCardHeader>
                <NewsprintCardContent>
                  <EditableReflectionItem
                    id={userMessages[0]?.id}
                    text={userMessages[0]?.text || ''}
                    placeholder="Edit your main reflection..."
                    className={isMobile ? 'min-h-[150px]' : 'min-h-[200px]'}
                    onUpdate={updateMessageById}
                  />
                </NewsprintCardContent>
              </NewsprintCard>
            ) : (
              <MainArticle
                headline={content.mainHeadline}
                byline="By [Your Name]"
                date={currentDate}
                content={content.longestMessage.text.replace(/[<>]/g, '')}
                imageCaption="Personal Reflection Moment"
                additionalContent={additionalContent}
              />
            )}

            {userMessages.length > 1 && (
              <div className={`${isMobile ? 'mt-6 pt-6' : 'mt-8 pt-8'} border-t-4 border-newsprint-foreground`}>
                <h3 className={`${newsprintTextStyles.h3} mb-2`}>
                  ADDITIONAL THOUGHTS AND REFLECTIONS
                </h3>
                <div className={`${newsprintTextStyles.metadata} mb-4`}>
                  By [Your Name] | {formatShortDate(new Date())}
                </div>
                {isEditing ? (
                  <div className="space-y-4">
                    {userMessages.slice(1).map((msg, index) => (
                      <EditableReflectionItem
                        key={msg.id}
                        id={msg.id}
                        text={msg.text}
                        placeholder={`Edit reflection ${index + 2}...`}
                        className={isMobile ? 'min-h-[80px]' : 'min-h-[100px]'}
                        onUpdate={updateMessageById}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={newsprintTextStyles.body}>
                    {additionalContent}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={isMobile ? '' : 'lg:col-span-1 pl-8'}>
            {!isMobile ? (
              <div className="lg:sticky lg:top-28">
                <SidebarHighlights highlights={content.highlights} />
              </div>
            ) : (
              <SidebarHighlights highlights={content.highlights} />
            )}
          </div>
        </div>

        {/* Thoughts & Reflections Section */}
        {content.articles.length > 0 && (
          <>
            {!isMobile && <SectionHeader title="THOUGHTS & REFLECTIONS" />}
            {isMobile && <h2 className={`${newsprintTextStyles.h2} mb-4 text-center`}>KEY REFLECTIONS</h2>}
            <ArticleGrid articles={content.articles} />
          </>
        )}

        {/* Inspirational Quote */}
        <NewsprintCard variant="inverted" className="mb-12">
          <QuoteBox quote={content.quote} attribution="" />
        </NewsprintCard>

        {/* Mobile Footer Actions */}
        {isMobile && !isEditing && (
          <div className="flex gap-3 mt-8">
            <Button onClick={handleShare} variant="newsprint-outline" className="flex-1 touch-target">
              <Share className="h-4 w-4 mr-2" />
              SHARE
            </Button>
            <Button onClick={handlePrint} variant="newsprint-outline" className="flex-1 touch-target">
              <Print className="h-4 w-4 mr-2" />
              PRINT
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

NewspaperRetrospective.displayName = 'NewspaperRetrospective';
