export interface EventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  emotion: string;
  emoji: string;
  class?: string;
  background?: boolean;
  split?: number;
  allDay?: boolean;
}
