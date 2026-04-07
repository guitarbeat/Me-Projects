/**
 * Event System - Application-wide event emitter for cross-component communication
 */

type EventCallback = (data?: unknown) => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, data?: unknown) {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((callback) => callback(data));
  }
}

export const eventEmitter = new EventEmitter();

// Event names
export const PROFILE_UPDATED_EVENT = 'profile:updated';
