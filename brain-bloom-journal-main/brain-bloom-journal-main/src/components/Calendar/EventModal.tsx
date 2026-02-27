import type { EventData } from '@/types/event-data';

interface EventModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: (event: Partial<EventData>) => void;
  onDelete?: (id: string) => void;
  event?: EventData | null;
  initialDate?: Date;
  initialTime?: { start: Date; end: Date };
}

const EventModal = (_props: EventModalProps) => null;

export default EventModal;
