#include "BillyBass.h"
#include "../utils/Debug.h"
#include <Arduino.h>

// Global instance definition
BillyBass billy;

// Constructor
BillyBass::BillyBass() : 
    mouthMotor(MOUTH_PIN1, MOUTH_PIN2),
    bodyMotor(BODY_PIN1, BODY_PIN2),
    _motorSpeed(DEFAULT_SPEED),
    _movementDuration(DEFAULT_DURATION),
    _motorState(0),
    _bodySpeed(0) {}

// Initialization
void BillyBass::begin() {
    mouthMotor.begin();
    bodyMotor.begin();
    resetMotorsToHome();
}

// Basic Movement Commands
void BillyBass::openMouth() {
    if (!isMouthOpen()) {
        DEBUG_PRINTLN(F("Opening mouth"));
        mouthMotor.setSpeed(calibration.mouthSpeed);
        mouthMotor.forward();
        delay(calibration.mouthOpenTime);
        mouthMotor.halt();
        _motorState |= MOUTH_OPEN_BIT;
    }
}

void BillyBass::closeMouth() {
    if (isMouthOpen()) {
        DEBUG_PRINTLN(F("Closing mouth"));
        mouthMotor.setSpeed(calibration.mouthSpeed);
        mouthMotor.backward();
        delay(calibration.mouthCloseTime);
        mouthMotor.halt();
        _motorState &= ~MOUTH_OPEN_BIT;
    }
}

void BillyBass::flapTail() {
    DEBUG_PRINTLN(F("Flapping tail"));
    bodyMotor.setSpeed(calibration.bodySpeed);
    bodyMotor.backward();
    delay(calibration.bodyBackTime);
    bodyMotor.halt();
}

void BillyBass::bodyForward() {
    DEBUG_PRINTLN(F("Moving body forward"));
    bodyMotor.setSpeed(calibration.bodySpeed);
    bodyMotor.forward();
    delay(calibration.bodyForwardTime);
    bodyMotor.halt();
}

// Helper method for motor movement
void BillyBass::moveMotor(BillyBassMotor* motor, uint8_t speed, bool forward, uint16_t duration) {
    if (!motor->isSafeToMove()) return;
    
    motor->setSpeed(speed);
    if (forward) {
        motor->forward();
    } else {
        motor->backward();
    }
    
    // Safety: Stop after maximum time
    delay(min(duration, MAX_MOTOR_ON_TIME));
    motor->smoothStop();
}

// Complex Sequences
void BillyBass::resetMotorsToHome() {
    // Close mouth if open
    if (isMouthOpen() && mouthMotor.isSafeToMove()) {
        closeMouth();
        delay(DEFAULT_DURATION);
    }
    
    // Return body to home position if moved
    if (isBodyMoved() && bodyMotor.isSafeToMove()) {
        bodyMotor.backward();
        delay(DEFAULT_DURATION);
        bodyMotor.smoothStop();
        _motorState &= ~BODY_MOVED_BIT;
    }
    
    // Stop all motors
    mouthMotor.stop();
    bodyMotor.stop();
    
    DEBUG_PRINTLN(F("Motors reset to home position"));
}

void BillyBass::singingMotion() {
    DEBUG_PRINTLN(F("Singing motion"));
    
    // Simple singing pattern with safety checks
    for (int i = 0; i < 3; i++) {
        if (!mouthMotor.isSafeToMove()) break;
        
        openMouth();
        if (mouthMotor.needsCooldown()) {
            delay(MOTOR_COOLDOWN_TIME);
        }
        
        closeMouth();
        if (mouthMotor.needsCooldown()) {
            delay(MOTOR_COOLDOWN_TIME);
        }
    }
    
    if (bodyMotor.isSafeToMove()) {
        flapTail();
        if (bodyMotor.needsCooldown()) {
            delay(MOTOR_COOLDOWN_TIME);
        }
        bodyForward();
    }
    
    DEBUG_PRINTLN(F("Singing motion completed"));
}

// Audio Reactive Methods
void BillyBass::articulateBody(bool isTalking) {
    if (!isTalking || !bodyMotor.isSafeToMove()) {
        if (bodyMotor.isMoving()) {
            bodyMotor.smoothStop();
            timing.bodyAction = timing.current + random(20, 50);
            DEBUG_PRINTLN(F("Body articulation stopped"));
        }
        return;
    }
    
    // Only change movement if it's time for a new action
    if (timing.current <= timing.bodyAction) return;
    
    // Movement pattern definitions
    static const uint8_t speeds[] = {0, 150, 200, 255};
    static const uint16_t durations[][2] = {
        {500, 1000},   // No/slow/medium movement
        {900, 1200},   // Tail flap
        {1500, 3000}   // Full speed
    };
    
    // Generate random movement pattern (0-7)
    uint8_t pattern = random(8);
    uint8_t speedIndex = pattern > 6 ? 3 : pattern > 4 ? 2 : pattern > 2 ? 1 : 0;
    _bodySpeed = speeds[speedIndex];
    
    // Set speed and direction with safety checks
    if (_bodySpeed > 0 && bodyMotor.isSafeToMove()) {
        bodyMotor.setSpeed(_bodySpeed);
        
        if (pattern <= 6) {
            bodyMotor.forward();
            _motorState |= BODY_MOVED_BIT;
        } else {
            bodyMotor.backward();
            _motorState &= ~BODY_MOVED_BIT;
        }
        
        // Set next action time with safety limit
        uint16_t duration = random(
            durations[speedIndex > 0 ? speedIndex - 1 : 0][0],
            min(durations[speedIndex > 0 ? speedIndex - 1 : 0][1], MAX_MOTOR_ON_TIME)
        );
        timing.bodyAction = timing.current + duration;
    } else {
        bodyMotor.smoothStop();
    }
}

// Random flap when "bored"
void BillyBass::flap() {
    if (bodyMotor.isSafeToMove()) {
        DEBUG_PRINTLN(F("Random flap"));
        flapTail();
    }
}

// Settings
void BillyBass::setMotorSpeed(uint8_t speed) {
    _motorSpeed = constrain(speed, MIN_SPEED, MAX_SPEED);
}

uint8_t BillyBass::getMotorSpeed() const {
    return _motorSpeed;
}

void BillyBass::setMovementDuration(uint16_t duration) {
    _movementDuration = min(duration, MAX_MOTOR_ON_TIME);
}

uint16_t BillyBass::getMovementDuration() const {
    return _movementDuration;
}

// State checks
bool BillyBass::isMouthOpen() const {
    return (_motorState & MOUTH_OPEN_BIT) != 0;
}

bool BillyBass::isBodyMoved() const {
    return (_motorState & BODY_MOVED_BIT) != 0;
}

// Calibration methods
void BillyBass::setMouthTiming(uint16_t openTime, uint16_t closeTime) {
    calibration.mouthOpenTime = min(openTime, MAX_MOVEMENT_TIME);
    calibration.mouthCloseTime = min(closeTime, MAX_MOVEMENT_TIME);
    DEBUG_PRINT(F("Mouth timing set to: "));
    DEBUG_PRINT(calibration.mouthOpenTime);
    DEBUG_PRINT(F("ms open, "));
    DEBUG_PRINT(calibration.mouthCloseTime);
    DEBUG_PRINTLN(F("ms close"));
}

void BillyBass::setBodyTiming(uint16_t forwardTime, uint16_t backTime) {
    calibration.bodyForwardTime = min(forwardTime, MAX_MOVEMENT_TIME);
    calibration.bodyBackTime = min(backTime, MAX_MOVEMENT_TIME);
    DEBUG_PRINT(F("Body timing set to: "));
    DEBUG_PRINT(calibration.bodyForwardTime);
    DEBUG_PRINT(F("ms forward, "));
    DEBUG_PRINT(calibration.bodyBackTime);
    DEBUG_PRINTLN(F("ms back"));
}

void BillyBass::setMouthSpeed(uint8_t speed) {
    calibration.mouthSpeed = min(speed, MAX_SPEED);
    DEBUG_PRINT(F("Mouth speed set to: "));
    DEBUG_PRINTLN(calibration.mouthSpeed);
}

void BillyBass::setBodySpeed(uint8_t speed) {
    calibration.bodySpeed = min(speed, MAX_SPEED);
    DEBUG_PRINT(F("Body speed set to: "));
    DEBUG_PRINTLN(calibration.bodySpeed);
} 