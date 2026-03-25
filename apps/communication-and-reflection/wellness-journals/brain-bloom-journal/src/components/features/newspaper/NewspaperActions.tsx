import { memo } from 'react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui';
import { Share, Printer as Print, Save, Edit3, X } from '@/lib/icons/icon-imports';
import { newsprintTextStyles } from '@/lib';
import { NewsprintCard } from '@/components/ui/newsprint-card';

interface NewspaperActionsProps {
  isMobile?: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
  onShare: () => void;
  onPrint: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  canEdit?: boolean;
}

export const NewspaperActions = memo<NewspaperActionsProps>(({
  isMobile = false,
  isEditing = false,
  isSaving = false,
  onShare,
  onPrint,
  onSave,
  onCancel,
  canEdit = false
}) => {
  if (isMobile) {
    return (
      <div className="sticky top-0 z-10 bg-newsprint-bg/95 backdrop-blur-sm border-b-4 border-newsprint-foreground mb-4 -mx-4 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className={`${newsprintTextStyles.h3} font-newsprint-serif`}>TAMPANA</h1>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onShare}
                      variant="newsprint-outline"
                      size="newsprint-sm"
                      className="touch-target"
                      aria-label="Share"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onPrint}
                      variant="newsprint-outline"
                      size="newsprint-sm"
                      className="touch-target"
                      aria-label="Print"
                    >
                      <Print className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Print</TooltipContent>
                </Tooltip>
              </>
            )}
            {canEdit && onSave && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={isEditing ? onSave : () => {}}
                    variant={isEditing ? "newsprint" : "newsprint-outline"}
                    size="newsprint-sm"
                    className="touch-target"
                    aria-label={isEditing ? "Save changes" : "Edit mode"}
                    loading={isEditing && isSaving}
                  >
                    {(!isSaving || !isEditing) && (isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isEditing ? "Save changes" : "Edit mode"}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <NewsprintCard variant="default" className="mb-6 border-newsprint-accent border-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className={`${newsprintTextStyles.h3} mb-1`}>EDIT MODE</h3>
            <p className={newsprintTextStyles.muted}>Click on any message text to edit it directly</p>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button onClick={onCancel} variant="newsprint-outline">
                <X className="h-4 w-4 mr-2" />
                CANCEL
              </Button>
            )}
            {onSave && (
              <Button onClick={onSave} variant="newsprint" loading={isSaving}>
                {!isSaving && <Save className="h-4 w-4 mr-2" />}
                SAVE CHANGES
              </Button>
            )}
          </div>
        </div>
      </NewsprintCard>
    );
  }

  return null;
});

NewspaperActions.displayName = 'NewspaperActions';
