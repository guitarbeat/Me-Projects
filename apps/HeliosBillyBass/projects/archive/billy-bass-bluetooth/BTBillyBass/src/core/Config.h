#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>  // For standard Arduino types and A0 constant
#include <stdint.h>   // For uint8_t and uint16_t types

/**
 * @file Config.h
 * @brief Configuration constants and data structures for BTBillyBass
 * 
 * This file contains all the configuration constants, pin assignments,
 * timing values, and data structures used throughout the BTBillyBass
 * project. It serves as the central configuration hub for the entire
 * application.
 * 
 * @author Arduino Community
 * @version 1.0
 * @date 2024
 */

// ===== Debug Configuration =====
/**
 * @brief Enable debug output
 * 
 * Set to 1 to enable debug messages via Serial output.
 * Set to 0 to disable debug output for production use.
 */
#define DEBUG 1  // Enable debug output to help diagnose issues

// ===== Safety Configuration =====
/**
 * @brief Maximum time a motor can run continuously (ms)
 * 
 * Prevents motor overheating by limiting continuous operation time.
 * Reduced from 1000ms to 500ms for enhanced safety.
 */
const uint16_t MAX_MOTOR_ON_TIME = 500;      // Reduced from 1000ms to 500ms for safety

/**
 * @brief Cooldown period between motor operations (ms)
 * 
 * Time the motor must rest between movements to prevent overheating.
 * Reduced from 2000ms to 1000ms to allow quicker response.
 */
const uint16_t MOTOR_COOLDOWN_TIME = 1000;   // Reduced from 2000ms to 1000ms to allow quicker response

/**
 * @brief Maximum consecutive movements before forced cooldown
 * 
 * Limits rapid-fire movements that could damage the motor.
 * Increased from 3 to 5 to allow for correction attempts.
 */
const uint8_t MAX_CONSECUTIVE_MOVES = 5;     // Increased from 3 to 5 to allow for correction attempts

/**
 * @brief Time for speed ramping (ms)
 * 
 * Duration for gradual speed changes to reduce mechanical stress.
 * Reduced from 200ms to 100ms for quicker response.
 */
const uint16_t RAMP_TIME = 100;             // Reduced from 200ms to 100ms for quicker response

/**
 * @brief Timeout for position confirmation (ms)
 * 
 * Maximum time to wait for a movement to complete before timing out.
 */
const uint8_t POSITION_TIMEOUT = 100;       // Time to wait for position confirmation

// ===== Pin Configuration =====
/**
 * @brief Pin assignments for motor control
 * 
 * These pins connect to the MX1508 motor drivers:
 * - MOUTH_PIN1/2: Control the mouth/jaw motor
 * - BODY_PIN1/2: Control the body/tail motor
 * - SOUND_PIN: Audio input from microphone or sound sensor
 */
const uint8_t MOUTH_PIN1 = 5;    ///< Mouth motor control pin 1 (MX1508 IN1)
const uint8_t MOUTH_PIN2 = 3;    ///< Mouth motor control pin 2 (MX1508 IN2)
const uint8_t BODY_PIN1 = 6;     ///< Body motor control pin 1 (MX1508 IN1)
const uint8_t BODY_PIN2 = 9;     ///< Body motor control pin 2 (MX1508 IN2)
const uint8_t SOUND_PIN = A0;    ///< Audio input pin (analog)

// ===== Motor & Movement Settings =====
/**
 * @brief Default motor speed for safe operation
 * 
 * Starting speed that provides good movement without stressing the motor.
 * Reduced from 60 to 35 for safer starting speed.
 */
const uint8_t DEFAULT_SPEED = 35;           // Reduced from 60 to 35 for safer starting speed

/**
 * @brief Minimum allowed motor speed
 * 
 * Lowest speed setting (0 = stopped).
 */
const uint8_t MIN_SPEED = 0;

/**
 * @brief Maximum allowed motor speed
 * 
 * Highest speed setting. Reduced from 255 to 180 for safety.
 */
const uint8_t MAX_SPEED = 180;              // Reduced from 255 to 180 for safety

/**
 * @brief Default speed for mouth movements
 * 
 * Speed specifically for mouth opening/closing operations.
 * Reduced from 200 to 150 for safer operation.
 */
const uint8_t MOUTH_SPEED = 150;            // Reduced from 200 to 150

/**
 * @brief Default speed for tail flapping
 * 
 * Speed specifically for tail flapping movements.
 * Reduced from 180 to 120 for safer operation.
 */
const uint8_t FLAP_SPEED = 120;             // Reduced from 180 to 120

// ===== Timing Constants (ms) =====
/**
 * @brief Default movement duration
 * 
 * Standard time for most movement operations.
 */
const uint16_t DEFAULT_DURATION = 800;

/**
 * @brief Pause time between movements
 * 
 * Brief pause to allow mechanical settling between operations.
 */
const uint16_t PAUSE_TIME = 300;

/**
 * @brief Idle timeout period
 * 
 * Time before the fish enters idle mode and performs random movements.
 */
const uint16_t IDLE_TIMEOUT = 1500;

/**
 * @brief Minimum interval between random flaps (ms)
 * 
 * Shortest time between automatic tail flaps during idle periods.
 */
const uint16_t FLAP_INTERVAL_MIN = 30000;

/**
 * @brief Maximum interval between random flaps (ms)
 * 
 * Longest time between automatic tail flaps during idle periods.
 */
const uint16_t FLAP_INTERVAL_MAX = 60000;

/**
 * @brief Maximum time for any single movement (ms)
 * 
 * Safety limit to prevent motors from running indefinitely.
 */
const uint16_t MAX_MOVEMENT_TIME = 1000;    // Maximum time for any single movement (ms)

// ===== Movement Calibration =====
/**
 * @brief Movement calibration structure
 * 
 * Contains timing and speed settings that can be adjusted
 * via serial commands for fine-tuning the fish's movements.
 * These values are used by the BillyBass class for movement control.
 */
struct MovementCalibration {
    uint16_t mouthOpenTime = 400;    ///< Time to run motor when opening mouth (ms)
    uint16_t mouthCloseTime = 400;   ///< Time to run motor when closing mouth (ms)
    uint16_t bodyForwardTime = 600;  ///< Time to run motor for body forward (ms)
    uint16_t bodyBackTime = 600;     ///< Time to run motor for body back (ms)
    uint8_t mouthSpeed = 150;        ///< Speed for mouth movement (0-255)
    uint8_t bodySpeed = 120;         ///< Speed for body movement (0-255)
};

// ===== Audio Settings =====
/**
 * @brief Threshold for detecting silence
 * 
 * Audio level below which is considered silence.
 * Used for audio-reactive behavior decisions.
 */
const uint16_t SILENCE_THRESHOLD = 12;

// ===== State Definitions =====
/**
 * @brief State constants for the fish's behavior state machine
 * 
 * These define the different states the fish can be in:
 * - WAITING: Idle state, waiting for input
 * - TALKING: Actively responding to audio
 * - FLAPPING: Performing tail flap movements
 */
const uint8_t STATE_WAITING = 0;     ///< Idle state, waiting for input
const uint8_t STATE_TALKING = 1;     ///< Actively responding to audio
const uint8_t STATE_FLAPPING = 2;    ///< Performing tail flap movements

// ===== Motor State Bit Masks =====
/**
 * @brief Bit masks for tracking motor positions
 * 
 * Used in the _motorState variable to track which motors
 * are in which positions for state management.
 */
const uint8_t MOUTH_OPEN_BIT = 0x01; ///< Bit 0: Mouth open state
const uint8_t BODY_MOVED_BIT = 0x02; ///< Bit 1: Body moved state

// ===== Emergency Override =====
/**
 * @brief Allow emergency mouth closing
 * 
 * When true, the mouth can always be closed regardless of
 * other safety checks. This prevents the fish from getting
 * stuck with its mouth open.
 */
const bool ALLOW_EMERGENCY_CLOSE = true;    // Always allow mouth to close regardless of safety checks

// ===== State Structures =====
/**
 * @brief Fish state tracking structure
 * 
 * Contains all the current state information for the fish,
 * including behavior state, mode settings, and audio data.
 */
struct FishState {
    uint8_t state;                  ///< Current state (WAITING, TALKING, FLAPPING)
    bool audioReactivityEnabled;    ///< Whether audio reactivity is enabled
    bool manualMode;                ///< Whether manual mode is enabled
    bool talking;                   ///< Whether the fish is currently talking
    uint16_t soundVolume;           ///< Current sound volume level
};

/**
 * @brief Timing tracking structure
 * 
 * Contains timing information for state machine operations
 * and movement coordination.
 */
struct TimingVars {
    unsigned long current;          ///< Current time in milliseconds
    unsigned long mouthAction;      ///< Time for next mouth action
    unsigned long bodyAction;       ///< Time for next body action
    unsigned long lastAction;       ///< Time of last action
};

// ===== Global Variable Declarations =====
/**
 * @brief Global state variables
 * 
 * These are declared here and defined in the main sketch file.
 * They provide global access to the fish's state and configuration.
 */
extern FishState fishState;         ///< Global fish state
extern TimingVars timing;           ///< Global timing variables
extern MovementCalibration calibration; ///< Global calibration settings
extern bool debugMode;              ///< Global debug mode flag

#endif // CONFIG_H 