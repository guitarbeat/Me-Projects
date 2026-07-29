#ifndef BILLYBASSMOTOR_H
#define BILLYBASSMOTOR_H

#include <MX1508.h>
#include "../core/Config.h"

/**
 * @file BillyBassMotor.h
 * @brief MX1508 DC motor control wrapper
 *
 * Provides basic speed and direction control with optional ramping.
 *
 * @author Arduino Community
 * @version 1.0
 * @date 2024
 *
 * @example
 * ```cpp
 * BillyBassMotor motor(5, 3);  // Pin1=5, Pin2=3
 * motor.begin();
 * motor.setSpeed(150);
 * motor.forward();
 * delay(1000);
 * motor.stop();
 * ```
 */
class BillyBassMotor {
public:
    /**
     * @brief Constructor
     * 
     * Creates a new motor controller instance with the specified pins.
     * 
     * @param pin1 First motor control pin (connected to MX1508 IN1)
     * @param pin2 Second motor control pin (connected to MX1508 IN2)
     */
    BillyBassMotor(uint8_t pin1, uint8_t pin2);
    
    // ===== Basic Motor Control =====
    
    /**
     * @brief Initialize the motor controller
     * 
     * Sets up the MX1508 driver and initializes all internal state.
     * Must be called before any motor operations.
     */
    void begin();
    
    /**
     * @brief Set the motor speed
     * 
     * Sets the PWM speed for the motor. The speed will be applied
     * on the next movement command.
     * 
     * @param speed Motor speed (0-255, where 0 is stopped and 255 is full speed)
     * @see getSpeed()
     */
    void setSpeed(uint8_t speed);
    
    /**
     * @brief Get the current motor speed setting
     * 
     * @return Current speed setting (0-255)
     * @see setSpeed()
     */
    uint8_t getSpeed() const;
    
    /**
     * @brief Move motor forward at current speed
     *
     * @see backward(), stop()
     */
    void forward();

    /**
     * @brief Move motor backward at current speed
     *
     * @see forward(), stop()
     */
    void backward();

    /**
     * @brief Immediately stop the motor
     *
     * Use smoothStop() for gradual deceleration.
     *
     * @see smoothStop(), halt()
     */
    void stop();

    /**
     * @brief Alias for stop()
     *
     * @see stop()
     */
    void halt();
    
    // ===== Advanced Motor Control =====
    
    /**
     * @brief Gradually increase speed to target
     * 
     * Ramps the motor speed from current to target speed over time.
     * Provides smooth acceleration and reduces mechanical stress.
     * 
     * @param targetSpeed The target speed to ramp to (0-255)
     * @param isForward True for forward direction, false for backward
     * @see smoothStop()
     */
    void rampSpeed(uint8_t targetSpeed, bool isForward);
    
    /**
     * @brief Gradually decrease speed to stop
     * 
     * Ramps the motor speed down to zero over time.
     * Provides smooth deceleration and reduces mechanical stress.
     * 
     * @see rampSpeed()
     */
    void smoothStop();
    
    // ===== Safety Features =====
    
    /**
     * @brief Check if motor is currently moving
     * 
     * @return True if motor is actively running, false if stopped
     */
    bool isMoving() const;
    
    /**
     * @brief Check if it's safe to move the motor
     *
     * Placeholder for future safety logic. Currently always true.
     */
    bool isSafeToMove() const;
    
    /**
     * @brief Immediately stop motor (emergency stop)
     * 
     * Forces the motor to stop immediately, bypassing normal
     * safety checks. Use only in emergency situations.
     */
    void emergencyStop();
    
    /**
     * @brief Determine if motor needs a cooldown period
     *
     * Placeholder for future logic. Currently always false.
     *
     * @see isSafeToMove()
     */
    bool needsCooldown() const;
    
    /**
     * @brief Get current motor run time
     * 
     * @return Current run time in milliseconds
     * @see resetRunTime()
     */
    unsigned long getRunTime() const;
    
    /**
     * @brief Reset the run time counter
     * 
     * Resets the internal timer that tracks how long the motor
     * has been running. Called automatically when motor stops.
     * 
     * @see getRunTime()
     */
    void resetRunTime();
    
    // ===== Emergency Override =====
    
    /**
     * @brief Force movement ignoring safety checks
     *
     * @param speed Motor speed (0-255)
     * @param isForward True for forward direction, false for backward
     */
    void forceMove(uint8_t speed, bool isForward);
    
private:
    MX1508 _motor;                   ///< MX1508 motor driver instance
    uint8_t _currentSpeed;           ///< Current motor speed setting
    bool _isMoving;                  ///< Current movement state
    unsigned long _moveStartTime;     ///< Timestamp when current movement started
    unsigned long _lastMoveTime;      ///< Timestamp when last movement ended
    uint8_t _consecutiveMoves;        ///< Count of consecutive movements for safety
    
    /**
     * @brief Update safety-related metrics
     * 
     * Internal method that updates timing and movement counters
     * used for safety calculations.
     */
    void updateSafetyMetrics();

    /**
     * @brief Apply speed and direction to the underlying driver
     *
     * Helper to reduce duplicated code when setting the motor's speed and
     * direction. Does not update internal state tracking.
     */
    void applySpeedDirection(uint8_t speed, bool isForward);
};

#endif // BILLYBASSMOTOR_H
