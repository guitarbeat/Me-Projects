import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { type Email } from '@shared/schema';

interface EmailCardProps {
  email: Email;
  index: number;
  isDragging?: boolean;
  dragOffset?: number;
  swipeDirection?: 'left' | 'right' | null;
  rotation?: number;
}

const AVATAR_COLORS = [
  'bg-red-100 text-red-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-yellow-100 text-yellow-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// ⚡ Bolt: Wrapped in React.memo to prevent re-rendering background cards during swipe animations
export const EmailCard = React.memo(
  function EmailCard({
    email,
    index,
    isDragging,
    dragOffset = 0,
    swipeDirection,
    rotation = 0,
  }: EmailCardProps) {
    // ⚡ Bolt: Memoize derived props to avoid recalculating on every render
    const initials = useMemo(() => getInitials(email.sender), [email.sender]);
    const avatarColor = useMemo(() => getAvatarColor(email.sender), [email.sender]);

    const cardVariants = {
      initial: { scale: 0.95 - index * 0.02, opacity: 0.8 - index * 0.3, rotate: index * 1 },
      animate: { scale: 1 - index * 0.03, opacity: 1 - index * 0.3, rotate: index * 1 },
      exit: {
        scale: 0.8,
        opacity: 0,
        rotate: dragOffset > 0 ? 30 : -30,
        x: dragOffset > 0 ? 400 : -400,
        transition: { duration: 0.3 },
      },
    };

    // Show action indicators during drag
    const showDeleteIndicator = isDragging && swipeDirection === 'left';
    const showLaterIndicator = isDragging && swipeDirection === 'right';

    // Calculate opacity for overlay based on drag distance
    const overlayOpacity = Math.min(Math.abs(dragOffset) / 150, 0.9);

    const cardStyle = {
      zIndex: 10 - index,
      scale: isDragging && index === 0 ? 1.02 : 1 - index * 0.02,
      opacity: index === 0 ? 1 : 0.8 - index * 0.15,
      y: index * 4,
      x: index === 0 ? dragOffset : 0,
      rotate: index === 0 ? rotation : index * 0.3,
    };

    return (
      <motion.div
        className={`absolute inset-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl ${
          index === 0 ? 'cursor-grab active:cursor-grabbing' : ''
        } overflow-hidden select-none`}
        style={cardStyle}
        transition={{
          type: isDragging && index === 0 ? false : 'spring',
          duration: isDragging && index === 0 ? 0 : 0.3,
          ease: 'easeOut',
          damping: 25,
          stiffness: 400,
        }}
      >
        {/* Swipe Action Overlays */}
        {showDeleteIndicator && (
          <div
            className="absolute inset-0 bg-red-500 flex items-center justify-start pl-8 z-10"
            style={{ opacity: overlayOpacity }}
          >
            <div className="text-white text-xl font-semibold">Delete</div>
          </div>
        )}
        {showLaterIndicator && (
          <div
            className="absolute inset-0 bg-green-500 flex items-center justify-end pr-8 z-10"
            style={{ opacity: overlayOpacity }}
          >
            <div className="text-white text-xl font-semibold">Later</div>
          </div>
        )}

        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${avatarColor}`}
            >
              <span className="font-medium text-lg">{initials}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                {email.sender}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{email.senderEmail}</p>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-lg leading-snug">
            {email.subject}
          </h4>

          <div className="flex-1 overflow-y-auto">
            <div className="text-gray-600 dark:text-gray-400 text-base leading-relaxed whitespace-pre-wrap">
              {email.body}
            </div>
          </div>
        </div>
      </motion.div>
    );
    // ⚡ Bolt: Custom equality function to ignore swipe-related props if not the top card
  },
  (prevProps, nextProps) => {
    // If the card is not the top card (index > 0), ignore drag/swipe props
    if (prevProps.index !== 0 && nextProps.index !== 0) {
      return prevProps.email.id === nextProps.email.id && prevProps.index === nextProps.index;
    }
    // Otherwise, fallback to shallow compare
    return (
      prevProps.email.id === nextProps.email.id &&
      prevProps.index === nextProps.index &&
      prevProps.isDragging === nextProps.isDragging &&
      prevProps.dragOffset === nextProps.dragOffset &&
      prevProps.swipeDirection === nextProps.swipeDirection &&
      prevProps.rotation === nextProps.rotation
    );
  }
);
