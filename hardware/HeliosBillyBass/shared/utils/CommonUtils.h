/**
 * @file CommonUtils.h
 * @brief Shared utility functions for all Billy Bass projects
 * @author HeliosBillyBass Team
 * @version 1.0
 * @date 2024
 */

#ifndef COMMON_UTILS_H
#define COMMON_UTILS_H

#include "Arduino.h"
#include "CommonConfig.h"

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * @brief Constrain a value between min and max
 * @param value Value to constrain
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @return Constrained value
 */
template<typename T>
T constrainValue(T value, T min, T max) {
    return (value < min) ? min : ((value > max) ? max : value);
}

/**
 * @brief Map a value from one range to another
 * @param value Value to map
 * @param inMin Input range minimum
 * @param inMax Input range maximum
 * @param outMin Output range minimum
 * @param outMax Output range maximum
 * @return Mapped value
 */
template<typename T>
T mapValue(T value, T inMin, T inMax, T outMin, T outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * @brief Check if enough time has passed since last action
 * @param lastTime Last action time (ms)
 * @param interval Required interval (ms)
 * @return true if enough time has passed
 */
bool hasTimeElapsed(unsigned long lastTime, unsigned long interval);

/**
 * @brief Get current time in milliseconds
 * @return Current time
 */
unsigned long getCurrentTime();

/**
 * @brief Calculate time difference safely
 * @param startTime Start time (ms)
 * @param endTime End time (ms)
 * @return Time difference (ms)
 */
unsigned long getTimeDifference(unsigned long startTime, unsigned long endTime);

/**
 * @brief Print debug information with timestamp
 * @param message Debug message
 */
void debugPrint(const char* message);

/**
 * @brief Print debug information with timestamp and value
 * @param message Debug message
 * @param value Value to print
 */
template<typename T>
void debugPrintValue(const char* message, T value) {
    DEBUG_PRINT("[");
    DEBUG_PRINT(getCurrentTime());
    DEBUG_PRINT("] ");
    DEBUG_PRINT(message);
    DEBUG_PRINT(": ");
    DEBUG_PRINTLN(value);
}

/**
 * @brief Print system status information
 * @param state Current fish state
 * @param calibration Current calibration settings
 */
void printSystemStatus(const FishState& state, const MotorCalibration& calibration);

/**
 * @brief Print help menu
 */
void printHelpMenu();

/**
 * @brief Print version information
 */
void printVersionInfo();

/**
 * @brief Initialize system with default settings
 * @param state Fish state to initialize
 * @param calibration Motor calibration to initialize
 */
void initializeSystem(FishState& state, MotorCalibration& calibration);

/**
 * @brief Validate motor speed
 * @param speed Speed to validate
 * @return Validated speed within limits
 */
uint8_t validateMotorSpeed(uint8_t speed);

/**
 * @brief Validate movement duration
 * @param duration Duration to validate
 * @return Validated duration within limits
 */
uint16_t validateMovementDuration(uint16_t duration);

/**
 * @brief Calculate motor speed with ramping
 * @param currentSpeed Current speed
 * @param targetSpeed Target speed
 * @param rampStep Ramp step size
 * @return New speed after ramping
 */
uint8_t calculateRampedSpeed(uint8_t currentSpeed, uint8_t targetSpeed, uint8_t rampStep = 5);

/**
 * @brief Check if motor is safe to operate
 * @param lastRunTime Last run time
 * @param consecutiveMoves Number of consecutive moves
 * @return true if motor is safe to operate
 */
bool isMotorSafeToRun(unsigned long lastRunTime, uint8_t consecutiveMoves);

/**
 * @brief Emergency stop all motors
 * @param motor1 First motor object
 * @param motor2 Second motor object
 */
template<typename MotorType>
void emergencyStop(MotorType& motor1, MotorType& motor2) {
    motor1.halt();
    motor2.halt();
    DEBUG_PRINTLN("EMERGENCY STOP: All motors halted");
}

// ============================================================================
// Inline Implementations
// ============================================================================

inline bool hasTimeElapsed(unsigned long lastTime, unsigned long interval) {
    return (getCurrentTime() - lastTime) >= interval;
}

inline unsigned long getCurrentTime() {
    return millis();
}

inline unsigned long getTimeDifference(unsigned long startTime, unsigned long endTime) {
    return endTime - startTime;
}

inline void debugPrint(const char* message) {
    DEBUG_PRINT("[");
    DEBUG_PRINT(getCurrentTime());
    DEBUG_PRINT("] ");
    DEBUG_PRINTLN(message);
}

inline uint8_t validateMotorSpeed(uint8_t speed) {
    return constrainValue(speed, MIN_SPEED, MAX_SPEED);
}

inline uint16_t validateMovementDuration(uint16_t duration) {
    return constrainValue(duration, MIN_MOVEMENT_TIME, MAX_MOVEMENT_TIME);
}

inline bool isMotorSafeToRun(unsigned long lastRunTime, uint8_t consecutiveMoves) {
    return hasTimeElapsed(lastRunTime, MOTOR_COOLDOWN_TIME) && 
           (consecutiveMoves < MAX_CONSECUTIVE_MOVES);
}

#endif // COMMON_UTILS_H
