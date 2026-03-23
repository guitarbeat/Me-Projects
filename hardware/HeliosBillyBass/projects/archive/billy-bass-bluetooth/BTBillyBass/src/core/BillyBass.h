#ifndef BILLYBASS_H
#define BILLYBASS_H

#include "../drivers/BillyBassMotor.h"
#include "Config.h"

/**
 * @file BillyBass.h
 * @brief High-level control interface for the Big Mouth Billy Bass animatronic fish
 * 
 * This class provides a comprehensive API for controlling the animatronic fish,
 * including basic movements, complex sequences, and audio-reactive behavior.
 * It abstracts the low-level motor control and provides a clean interface
 * for the main application.
 * 
 * @author Arduino Community
 * @version 1.0
 * @date 2024
 * 
 * @example
 * ```cpp
 * BillyBass billy;
 * billy.begin();
 * billy.openMouth();
 * billy.singingMotion();
 * ```
 */
class BillyBass {
public:
    /**
     * @brief Default constructor
     * 
     * Initializes the BillyBass controller with default settings.
     * Call begin() after construction to initialize hardware.
     */
    BillyBass();
    
    /**
     * @brief Initialize the BillyBass controller
     * 
     * Sets up motor drivers and initializes all hardware components.
     * Must be called before any movement commands.
     */
    void begin();
    
    // ===== Basic Movement Controls =====
    
    /**
     * @brief Open the fish's mouth
     * 
     * Activates the mouth motor to open the jaw mechanism.
     * Uses calibrated timing and speed settings.
     * 
     * @see setMouthTiming(), setMouthSpeed()
     */
    void openMouth();
    
    /**
     * @brief Close the fish's mouth
     * 
     * Activates the mouth motor to close the jaw mechanism.
     * Uses calibrated timing and speed settings.
     * 
     * @see setMouthTiming(), setMouthSpeed()
     */
    void closeMouth();
    
    /**
     * @brief Flap the fish's tail
     * 
     * Activates the body motor to create a tail-flapping motion.
     * Uses calibrated timing and speed settings.
     * 
     * @see setBodyTiming(), setBodySpeed()
     */
    void flapTail();
    
    /**
     * @brief Move the fish's body forward
     * 
     * Activates the body motor to move the entire body forward.
     * Creates a swimming-like motion.
     * 
     * @see setBodyTiming(), setBodySpeed()
     */
    void bodyForward();
    
    // ===== Complex Movement Sequences =====
    
    /**
     * @brief Reset all motors to home position
     * 
     * Returns both mouth and body motors to their default/resting positions.
     * Useful for initialization or after unexpected behavior.
     */
    void resetMotorsToHome();
    
    /**
     * @brief Execute a singing motion sequence
     * 
     * Performs a coordinated sequence of mouth and body movements
     * that simulates the fish singing. Combines mouth opening/closing
     * with body movement for a natural singing appearance.
     */
    void singingMotion();
    
    /**
     * @brief Perform a random flap when "bored"
     * 
     * Executes a random tail flap motion, typically used during idle periods
     * to make the fish appear more lifelike and interactive.
     */
    void flap();
    
    // ===== Audio-Reactive Controls =====
    
    /**
     * @brief Articulate body based on talking state
     * 
     * Controls body movement in response to audio input or talking state.
     * Creates natural-looking body language during speech.
     * 
     * @param isTalking True if the fish should appear to be talking
     */
    void articulateBody(bool isTalking);
    
    // ===== Settings and Configuration =====
    
    /**
     * @brief Set the motor speed for all movements
     * 
     * @param speed Motor speed (0-255, where 0 is stopped and 255 is full speed)
     * @see getMotorSpeed()
     */
    void setMotorSpeed(uint8_t speed);
    
    /**
     * @brief Get the current motor speed setting
     * 
     * @return Current motor speed (0-255)
     * @see setMotorSpeed()
     */
    uint8_t getMotorSpeed() const;
    
    /**
     * @brief Set the duration for movement operations
     * 
     * @param duration Movement duration in milliseconds
     * @see getMovementDuration()
     */
    void setMovementDuration(uint16_t duration);
    
    /**
     * @brief Get the current movement duration setting
     * 
     * @return Current movement duration in milliseconds
     * @see setMovementDuration()
     */
    uint16_t getMovementDuration() const;
    
    // ===== Calibration Methods =====
    
    /**
     * @brief Set mouth movement timing
     * 
     * @param openTime Time in milliseconds to open mouth
     * @param closeTime Time in milliseconds to close mouth
     * @see setMouthSpeed()
     */
    void setMouthTiming(uint16_t openTime, uint16_t closeTime);
    
    /**
     * @brief Set body movement timing
     * 
     * @param forwardTime Time in milliseconds for body forward movement
     * @param backTime Time in milliseconds for body return movement
     * @see setBodySpeed()
     */
    void setBodyTiming(uint16_t forwardTime, uint16_t backTime);
    
    /**
     * @brief Set mouth motor speed
     * 
     * @param speed Speed for mouth movements (0-255)
     * @see setMouthTiming()
     */
    void setMouthSpeed(uint8_t speed);
    
    /**
     * @brief Set body motor speed
     * 
     * @param speed Speed for body movements (0-255)
     * @see setBodyTiming()
     */
    void setBodySpeed(uint8_t speed);
    
    // ===== State Queries =====
    
    /**
     * @brief Check if mouth is currently open
     * 
     * @return True if mouth is open, false if closed
     */
    bool isMouthOpen() const;
    
    /**
     * @brief Check if body is currently moved from home position
     * 
     * @return True if body is moved, false if at home position
     */
    bool isBodyMoved() const;

    // ===== Public Motor Instances =====
    
    BillyBassMotor mouthMotor;  ///< Controls the mouth/jaw mechanism
    BillyBassMotor bodyMotor;   ///< Controls the body/tail movement

private:
    /**
     * @brief Helper method for motor movement
     * 
     * Internal method that handles the common motor movement logic
     * with safety checks and timing control.
     * 
     * @param motor Pointer to the motor to control
     * @param speed Speed for the movement (0-255)
     * @param forward True for forward direction, false for backward
     * @param duration Duration of the movement in milliseconds
     */
    void moveMotor(BillyBassMotor* motor, uint8_t speed, bool forward, uint16_t duration);
    
    uint8_t _motorSpeed;        ///< Current speed setting for all motors
    uint16_t _movementDuration; ///< Current duration setting for movements
    uint8_t _motorState;        ///< Bit flags tracking motor positions
    uint8_t _bodySpeed;         ///< Specific speed for body articulation
};

// Global instance for easy access throughout the application
extern BillyBass billy;

#endif // BILLYBASS_H 