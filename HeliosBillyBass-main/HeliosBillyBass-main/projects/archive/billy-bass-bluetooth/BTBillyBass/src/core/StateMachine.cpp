#include "StateMachine.h"
#include "../utils/Debug.h"
#include <Arduino.h>

/**
 * Updates sound input from analog pin
 * Reads the current sound level and stores it in the global soundVolume variable
 */
void updateSoundInput() {
    // Read analog input and update sound volume
    fishState.soundVolume = analogRead(SOUND_PIN);
    
    // Only print debug if volume is above threshold and debug mode is on
    if (debugMode && fishState.soundVolume > SILENCE_THRESHOLD) {
        DEBUG_PRINT(F("Sound: "));
        DEBUG_PRINTLN(fishState.soundVolume);
    }
}

/**
 * State machine for Billy Bass
 * Manages the fish's behavior based on current state, sound input, and timing
 */
void stateMachineBillyBass() {
    static uint8_t lastState = STATE_WAITING;
    
    // Only print state changes
    if (debugMode && lastState != fishState.state) {
        DEBUG_PRINT(F("State change: "));
        DEBUG_PRINTLN(fishState.state);
        lastState = fishState.state;
    }
    
    uint8_t prevState = fishState.state;
    
    switch (fishState.state) {
        case STATE_WAITING: // Waiting for input
            // Check for sound above threshold
            if (fishState.soundVolume > SILENCE_THRESHOLD && timing.current > timing.mouthAction) { 
                fishState.talking = true; 
                timing.mouthAction = timing.current + PAUSE_TIME;
                fishState.state = STATE_TALKING; // Transition to talking state
            } 
            // Stop motors if beyond scheduled talking time
            else if (timing.current > timing.mouthAction + PAUSE_TIME) { 
                billy.mouthMotor.stop();
                billy.bodyMotor.stop();
            }
            
            // Check if fish has been idle too long
            if (timing.current - timing.lastAction > IDLE_TIMEOUT) { 
                // Schedule next random flap
                timing.lastAction = timing.current + random(FLAP_INTERVAL_MIN, FLAP_INTERVAL_MAX); 
                fishState.state = STATE_FLAPPING; // Transition to flapping state
            }
            break;

        case STATE_TALKING: // Talking (mouth moving)
            if (timing.current < timing.mouthAction) { 
                // If we have a scheduled mouth action in the future
                if (fishState.talking) { 
                    // Open mouth and articulate body
                    billy.openMouth(); 
                    timing.lastAction = timing.current;
                    billy.articulateBody(true);
                }
            }
            else { 
                // Close mouth and stop articulating
                billy.closeMouth();
                billy.articulateBody(false);
                fishState.talking = false;
                fishState.state = STATE_WAITING; // Return to waiting state
            }
            break;

        case STATE_FLAPPING: // Flapping (random movement)
            // Perform a single flap
            billy.flap();
            fishState.state = STATE_WAITING; // Return to waiting state
            break;
            
        default:
            // Invalid state, reset to waiting
            fishState.state = STATE_WAITING;
            break;
    }
    
    // Log state transitions
    if (prevState != fishState.state) {
        debugStateTransition(prevState, fishState.state);
    }
} 