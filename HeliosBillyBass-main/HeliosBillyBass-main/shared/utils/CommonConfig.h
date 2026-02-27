/**
 * @file CommonConfig.h
 * @brief Shared configuration constants and structures for all Billy Bass projects
 * @author HeliosBillyBass Team
 * @version 1.0
 * @date 2024
 */

#ifndef COMMON_CONFIG_H
#define COMMON_CONFIG_H

// ============================================================================
// Hardware Configuration
// ============================================================================

// Pin Definitions
#define SOUND_PIN A0                    ///< Audio input pin
#define MOUTH_MOTOR_PIN1 5              ///< Mouth motor control pin 1
#define MOUTH_MOTOR_PIN2 3              ///< Mouth motor control pin 2
#define BODY_MOTOR_PIN1 6               ///< Body motor control pin 1
#define BODY_MOTOR_PIN2 9               ///< Body motor control pin 2

// Motor Control Limits
#define MIN_SPEED 0                     ///< Minimum motor speed
#define MAX_SPEED 180                   ///< Maximum motor speed for safety
#define DEFAULT_SPEED 100               ///< Default motor speed

// Timing Constants
#define MAX_MOVEMENT_TIME 1000          ///< Maximum movement duration (ms)
#define MIN_MOVEMENT_TIME 50            ///< Minimum movement duration (ms)
#define DEFAULT_MOUTH_OPEN_TIME 400     ///< Default mouth open duration (ms)
#define DEFAULT_MOUTH_CLOSE_TIME 400    ///< Default mouth close duration (ms)
#define DEFAULT_BODY_FORWARD_TIME 800   ///< Default body forward duration (ms)
#define DEFAULT_BODY_BACK_TIME 800      ///< Default body back duration (ms)

// Audio Processing
#define SILENCE_THRESHOLD 12            ///< Audio threshold for silence detection
#define AUDIO_SAMPLE_RATE 100           ///< Audio sampling rate (Hz)

// Safety Limits
#define MAX_CONSECUTIVE_MOVES 5         ///< Maximum consecutive movements
#define MOTOR_COOLDOWN_TIME 1000        ///< Cooldown between motor operations (ms)
#define MAX_MOTOR_RUN_TIME 500          ///< Maximum continuous motor run time (ms)

// ============================================================================
// State Machine Constants
// ============================================================================

// State Definitions
#define STATE_WAITING 0                 ///< Idle state
#define STATE_TALKING 1                 ///< Audio-reactive state
#define STATE_FLAPPING 2                ///< Performing movements state

// ============================================================================
// Serial Communication
// ============================================================================

#define SERIAL_BAUD_RATE 9600           ///< Serial communication baud rate
#define COMMAND_BUFFER_SIZE 32          ///< Maximum command buffer size

// ============================================================================
// Common Data Structures
// ============================================================================

/**
 * @brief Motor calibration settings
 */
struct MotorCalibration {
    uint16_t mouthOpenTime = DEFAULT_MOUTH_OPEN_TIME;     ///< Mouth open duration (ms)
    uint16_t mouthCloseTime = DEFAULT_MOUTH_CLOSE_TIME;   ///< Mouth close duration (ms)
    uint16_t bodyForwardTime = DEFAULT_BODY_FORWARD_TIME; ///< Body forward duration (ms)
    uint16_t bodyBackTime = DEFAULT_BODY_BACK_TIME;       ///< Body back duration (ms)
    uint8_t mouthSpeed = DEFAULT_SPEED;                   ///< Mouth motor speed (0-255)
    uint8_t bodySpeed = DEFAULT_SPEED;                    ///< Body motor speed (0-255)
};

/**
 * @brief Fish state information
 */
struct FishState {
    uint8_t state = STATE_WAITING;        ///< Current state
    bool audioReactivityEnabled = true;   ///< Audio reactivity mode
    bool manualMode = true;               ///< Manual control mode
    bool talking = false;                 ///< Currently talking
    uint16_t soundVolume = 0;             ///< Current sound volume
};

/**
 * @brief Timing variables for state management
 */
struct TimingVars {
    unsigned long current = 0;            ///< Current time (ms)
    unsigned long mouthAction = 0;        ///< Next mouth action time
    unsigned long bodyAction = 0;         ///< Next body action time
    unsigned long lastAction = 0;         ///< Last action time
};

// ============================================================================
// Debug Configuration
// ============================================================================

#ifdef DEBUG
    #define DEBUG_PRINT(x) Serial.print(x)
    #define DEBUG_PRINTLN(x) Serial.println(x)
#else
    #define DEBUG_PRINT(x)
    #define DEBUG_PRINTLN(x)
#endif

// ============================================================================
// Version Information
// ============================================================================

#define FIRMWARE_VERSION_MAJOR 1
#define FIRMWARE_VERSION_MINOR 0
#define FIRMWARE_VERSION_PATCH 0

#define FIRMWARE_VERSION_STRING "1.0.0"

#endif // COMMON_CONFIG_H
