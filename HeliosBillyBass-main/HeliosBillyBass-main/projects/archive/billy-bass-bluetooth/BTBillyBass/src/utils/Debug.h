#ifndef DEBUG_H
#define DEBUG_H

#include <Arduino.h>
#include "../core/Config.h"

// Debug macros for consistent logging
#if DEBUG
  #define DEBUG_PRINT(x) if (debugMode) Serial.print(x)
  #define DEBUG_PRINTLN(x) if (debugMode) Serial.println(x)
  #define DEBUG_PRINTF(format, ...) if (debugMode) { char buffer[80]; sprintf(buffer, format, __VA_ARGS__); Serial.print(buffer); }
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
  #define DEBUG_PRINTF(format, ...)
#endif

// Print a state transition message
inline void debugStateTransition(uint8_t fromState, uint8_t toState) {
#if DEBUG
  if (debugMode) {
    static const char* states[] = {"Waiting", "Talking", "Flapping", "Unknown"};
    uint8_t fromIdx = fromState < 3 ? fromState : 3;
    uint8_t toIdx = toState < 3 ? toState : 3;
    
    Serial.print(F("State: "));
    Serial.print(states[fromIdx]);
    Serial.print(F(" → "));
    Serial.println(states[toIdx]);
  }
#endif
}

#endif // DEBUG_H 