import { memo, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Button, 
  NewsprintCard, 
  NewsprintCardHeader, 
  NewsprintCardTitle, 
  NewsprintCardContent,
  NewsprintTextarea,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui';
import { Edit, Trash2, Save, X, Calendar, FileText, ArrowLeft } from '@/lib/icons/icon-imports';
import { newsprintTextStyles, getTypeIcon, getTypeColor } from '@/lib';
import { Badge } from '@/components/ui';
import type { Retrospective, Message } from '@/types';

interface EntryDetailViewProps {
  retrospective: Retrospective | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (retrospective: Retrospective) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent: (id: string, messages: Message[]) => void;
  onBack?: () => void;
}

export const EntryDetailView = memo<EntryDetailViewProps>(({
  retrospective,
  isEditing,
  onEdit,
  onCancelEdit,
  onDelete,
  onUpdateTitle,
  onUpdateContent,
  onBack
}) => {
  const [editTitle, setEditTitle] = useState('');
  const [editMessages, setEditMessages] = useState<Message[]>([]);

  // Initialize edit state when editing starts
  useMemo(() => {
    if (isEditing && retrospective) {
      setEditTitle(retrospective.title);
      setEditMessages(retrospective.content?.messages || []);
    }
  }, [isEditing, retrospective]);

  if (!retrospective) {
    return (
      <NewsprintCard variant="default" className="h-full min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-newsprint-neutral-400" />
          <h3 className={`${newsprintTextStyles.h3} text-lg mb-1`}>Select Entry</h3>
          <p className={`${newsprintTextStyles.muted} text-sm`}>
            Choose from the timeline
          </p>
        </div>
      </NewsprintCard>
    );
  }

  const TypeIcon = getTypeIcon(retrospective.retrospective_type);
  const typeColor = getTypeColor(retrospective.retrospective_type);
  
  const formattedDate = (() => {
    try {
      return format(parseISO(retrospective.retrospective_date), 'EEE, MMM d, yyyy');
    } catch {
      return retrospective.retrospective_date;
    }
  })();

  const messages = retrospective.content?.messages || [];
  const userMessages = messages.filter((m: Message) => m.isUser);

  const handleSave = () => {
    if (editTitle !== retrospective.title) {
      onUpdateTitle(retrospective.id, editTitle);
    }
    onUpdateContent(retrospective.id, editMessages);
  };

  const updateMessageText = (index: number, newText: string) => {
    setEditMessages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  };

  return (
    <NewsprintCard variant="default" className="h-full">
      <NewsprintCardHeader className="border-b border-newsprint-border pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {onBack && (
              <Button variant="newsprint-ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-newsprint-serif font-bold mb-2"
                placeholder="Title..."
              />
            ) : (
              <NewsprintCardTitle className="text-xl mb-1 truncate">
                {retrospective.title}
              </NewsprintCardTitle>
            )}
            
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className={`${newsprintTextStyles.metadata} flex items-center gap-1`}>
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              <Badge variant="outline" className={`sharp-corners text-xs ${typeColor}`}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {retrospective.retrospective_type}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="newsprint-ghost"
                      size="icon"
                      onClick={onCancelEdit}
                      className="h-8 w-8"
                      aria-label="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cancel editing</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="newsprint"
                      size="icon"
                      onClick={handleSave}
                      className="h-8 w-8"
                      aria-label="Save changes"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save changes</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="newsprint-ghost"
                      size="icon"
                      onClick={onEdit}
                      className="h-8 w-8"
                      aria-label="Edit entry"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit entry</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="newsprint-ghost"
                      size="icon"
                      onClick={() => onDelete(retrospective)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete entry</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </NewsprintCardHeader>
      
      <NewsprintCardContent className="pt-4">
        {userMessages.length === 0 ? (
          <p className={`${newsprintTextStyles.muted} text-center py-6 text-sm`}>
            No reflections recorded
          </p>
        ) : (
          <div className="space-y-4">
            {isEditing ? (
              editMessages.map((message, index) => (
                <div key={message.id || index}>
                  <label className={`${newsprintTextStyles.metadata} block mb-1 text-xs`}>
                    {message.isUser ? 'Your Reflection' : 'AI Response'}
                  </label>
                  <NewsprintTextarea
                    value={message.text}
                    onChange={(e) => updateMessageText(index, e.target.value)}
                    className="min-h-[80px]"
                    disabled={!message.isUser}
                  />
                </div>
              ))
            ) : (
              userMessages.map((message: Message, index: number) => (
                <div 
                  key={message.id || index}
                  className="border-l-2 border-newsprint-accent pl-3"
                >
                  <p className={`${newsprintTextStyles.body} text-sm leading-relaxed`}>
                    {message.text}
                  </p>
                  {message.timestamp && (
                    <p className={`${newsprintTextStyles.caption} mt-1 text-xs`}>
                      {format(new Date(message.timestamp), 'h:mm a')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </NewsprintCardContent>
    </NewsprintCard>
  );
});

EntryDetailView.displayName = 'EntryDetailView';
