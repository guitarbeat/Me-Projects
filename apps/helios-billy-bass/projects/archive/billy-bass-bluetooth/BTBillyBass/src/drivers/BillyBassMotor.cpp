#include "BillyBassMotor.h"
#include "../utils/Debug.h"

// Constructor
BillyBassMotor::BillyBassMotor(uint8_t pin1, uint8_t pin2)
    : _motor(pin1, pin2),
      _currentSpeed(0),
      _isMoving(false),
      _moveStartTime(0),
      _lastMoveTime(0),
      _consecutiveMoves(0) {}

// Basic Motor Control
void BillyBassMotor::begin() {
    stop();
    // MX1508 doesn't need initialization
}

void BillyBassMotor::setSpeed(uint8_t speed) {
    _currentSpeed = speed;
    _motor.setSpeed(speed);
    if (speed > 0 && !_isMoving) {
        _moveStartTime = millis();
        _isMoving = true;
        if (debugMode) {
            DEBUG_PRINT(F("Motor started: Speed="));
            DEBUG_PRINTLN(_currentSpeed);
        }
    }
}

uint8_t BillyBassMotor::getSpeed() const {
    return _currentSpeed;
}

void BillyBassMotor::forward() {
    _motor.setSpeed(_currentSpeed);
    _motor.forward();
    if (debugMode) {
        DEBUG_PRINTLN(F("Motor: Forward"));
    }
}

void BillyBassMotor::backward() {
    _motor.setSpeed(_currentSpeed);
    _motor.backward();
    if (debugMode) {
        DEBUG_PRINTLN(F("Motor: Backward"));
    }
}

void BillyBassMotor::stop() {
    _motor.halt();
    _currentSpeed = 0;
    _isMoving = false;
    if (_moveStartTime > 0) {
        _lastMoveTime = millis();
        _moveStartTime = 0;
        if (debugMode) {
            DEBUG_PRINTLN(F("Motor: Stopped"));
        }
    }
}

void BillyBassMotor::halt() {
    stop();
}

void BillyBassMotor::rampSpeed(uint8_t targetSpeed, bool isForward) {
    if (!isSafeToMove()) {
        DEBUG_PRINTLN(F("Ramp movement blocked - safety check failed"));
        return;
    }
    
    uint8_t startSpeed = _currentSpeed;
    unsigned long startTime = millis();
    
    while (millis() - startTime < RAMP_TIME) {
        float progress = (float)(millis() - startTime) / RAMP_TIME;
        uint8_t speed = startSpeed + (targetSpeed - startSpeed) * progress;

        applySpeedDirection(speed, isForward);

        if (!isSafeToMove()) {
            emergencyStop();
            return;
        }

        delay(5);  // Small delay for smooth ramping
    }

    applySpeedDirection(targetSpeed, isForward);
    _currentSpeed = targetSpeed;
}

void BillyBassMotor::smoothStop() {
    if (_currentSpeed == 0) return;
    
    unsigned long startTime = millis();
    uint8_t startSpeed = _currentSpeed;
    
    while (millis() - startTime < RAMP_TIME && _currentSpeed > 0) {
        float progress = (float)(millis() - startTime) / RAMP_TIME;
        uint8_t speed = startSpeed * (1.0 - progress);
        _motor.setSpeed(speed);
        _motor.forward();  // Direction doesn't matter when stopping
        delay(5);
    }
    
    _motor.halt();
    _currentSpeed = 0;
}

void BillyBassMotor::emergencyStop() {
    _motor.halt();
    _currentSpeed = 0;
    _isMoving = false;
    _moveStartTime = 0;
    _lastMoveTime = millis();
    DEBUG_PRINTLN(F("EMERGENCY STOP ACTIVATED"));
}

bool BillyBassMotor::isMoving() const {
    return _isMoving;
}

bool BillyBassMotor::isSafeToMove() const {
    return true;  // Safety checks removed in favor of calibration system
}

bool BillyBassMotor::needsCooldown() const {
    return false;  // Cooldown removed in favor of calibration system
}

unsigned long BillyBassMotor::getRunTime() const {
    if (!_isMoving) return 0;
    return millis() - _moveStartTime;
}

void BillyBassMotor::resetRunTime() {
    _moveStartTime = millis();
}

void BillyBassMotor::forceMove(uint8_t speed, bool isForward) {
    setSpeed(speed);
    applySpeedDirection(_currentSpeed, isForward);
}

void BillyBassMotor::applySpeedDirection(uint8_t speed, bool isForward) {
    _motor.setSpeed(speed);
    if (isForward) {
        _motor.forward();
    } else {
        _motor.backward();
    }
}
