import { memo } from 'react';
import { Brain } from '@/lib/icons/icon-imports';
import { formatTime, newsprintTextStyles } from '@/lib';
import { EmptyState } from '@/components/common';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

export const MessageItem = memo<{ message: Message; isMobile?: boolean }>(({ message, isMobile = false }) => (
  <div 
    className={cn(
      'flex animate-fade-in',
      message.isUser ? 'justify-end' : 'justify-start'
    )}
  >
    <div 
      className={cn(
        'max-w-[85%] sharp-corners border-2 transition-all duration-200 hover:shadow-newsprint-hard',
        message.isUser 
          ? 'bg-newsprint-foreground text-newsprint-bg border-newsprint-foreground' 
          : 'bg-newsprint-bg text-newsprint-foreground border-newsprint-border'
      )}
    >
      {/* Message Header */}
      <div className={cn(
        'px-3 py-1.5 border-b',
        message.isUser ? 'border-newsprint-neutral-700' : 'border-newsprint-border'
      )}>
        <span className={cn(
          newsprintTextStyles.metadata,
          'text-[10px] uppercase tracking-[0.15em]',
          message.isUser && 'opacity-70'
        )}>
          {message.isUser ? '• YOUR MEMO •' : '• EDITOR •'}
        </span>
      </div>
      
      {/* Message Body */}
      <div className="p-3">
        <p className={cn(
          'font-newsprint-serif leading-relaxed',
          isMobile ? 'text-sm' : 'text-base'
        )}>
          {message.text}
        </p>
        <p className={cn(
          newsprintTextStyles.metadata,
          'text-[10px] mt-2',
          message.isUser && 'opacity-60'
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  </div>
));

MessageItem.displayName = 'MessageItem';

export const TypingIndicator = memo<{ isMobile?: boolean }>(({ isMobile = false }) => (
  <div className="flex justify-start animate-fade-in">
    <div className="sharp-corners border-2 border-newsprint-border bg-newsprint-bg">
      <div className="px-3 py-1.5 border-b border-newsprint-border">
        <span className={cn(newsprintTextStyles.metadata, 'text-[10px] uppercase tracking-[0.15em]')}>
          • NEWSROOM •
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-1.5 h-1.5 bg-newsprint-foreground sharp-corners animate-bounce"
                style={{ animationDelay: `${i * 100}ms`, animationDuration: '0.8s' }}
              />
            ))}
          </div>
          <span className={cn(
            newsprintTextStyles.metadata,
            isMobile ? 'text-xs' : 'text-sm',
            'italic'
          )}>
            Composing...
          </span>
        </div>
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

export const ChatEmptyState = memo<{ isMobile?: boolean }>(({ isMobile = false }) => (
  <EmptyState
    icon={Brain}
    title="The Editor's Desk"
    description="Share what's on your mind. The editor will respond with reflective insights."
    size={isMobile ? 'sm' : 'md'}
    variant="inline"
  />
));

ChatEmptyState.displayName = 'ChatEmptyState';
