/**
 * @file CommonUtils.cpp
 * @brief Implementation of shared utility functions for all Billy Bass projects
 * @author HeliosBillyBass Team
 * @version 1.0
 * @date 2024
 */

#include "CommonUtils.h"

// ============================================================================
// Utility Function Implementations
// ============================================================================

void printSystemStatus(const FishState& state, const MotorCalibration& calibration) {
    Serial.println(F("\n=== SYSTEM STATUS ==="));
    
    // State information
    Serial.print(F("Current State: "));
    switch (state.state) {
        case STATE_WAITING:
            Serial.println(F("WAITING"));
            break;
        case STATE_TALKING:
            Serial.println(F("TALKING"));
            break;
        case STATE_FLAPPING:
            Serial.println(F("FLAPPING"));
            break;
        default:
            Serial.println(F("UNKNOWN"));
            break;
    }
    
    // Mode information
    Serial.print(F("Audio Reactivity: "));
    Serial.println(state.audioReactivityEnabled ? F("ON") : F("OFF"));
    
    Serial.print(F("Manual Mode: "));
    Serial.println(state.manualMode ? F("ON") : F("OFF"));
    
    Serial.print(F("Talking: "));
    Serial.println(state.talking ? F("YES") : F("NO"));
    
    Serial.print(F("Sound Volume: "));
    Serial.println(state.soundVolume);
    
    // Calibration information
    Serial.println(F("\n=== CALIBRATION SETTINGS ==="));
    Serial.print(F("Mouth Timing (open,close): "));
    Serial.print(calibration.mouthOpenTime);
    Serial.print(F("ms, "));
    Serial.println(calibration.mouthCloseTime);
    
    Serial.print(F("Body Timing (forward,back): "));
    Serial.print(calibration.bodyForwardTime);
    Serial.print(F("ms, "));
    Serial.println(calibration.bodyBackTime);
    
    Serial.print(F("Motor Speeds (mouth,body): "));
    Serial.print(calibration.mouthSpeed);
    Serial.print(F(", "));
    Serial.println(calibration.bodySpeed);
    
    Serial.println(F("============================="));
}

void printHelpMenu() {
    Serial.println(F("\n🐟 === BILLY BASS CONTROL CENTER === 🐟"));
    Serial.println(F("\n📋 MOVEMENT COMMANDS:"));
    Serial.println(F("o: Open mouth    c: Close mouth"));
    Serial.println(F("f: Flap tail     b: Body forward"));
    Serial.println(F("r: Reset position"));
    
    Serial.println(F("\n⚙️ CALIBRATION:"));
    Serial.println(F("t: Set mouth timing (open,close)"));
    Serial.println(F("y: Set body timing (forward,back)"));
    Serial.println(F("m: Set mouth speed"));
    Serial.println(F("n: Set body speed"));
    Serial.println(F("p: Print current settings"));
    
    Serial.println(F("\n🔄 MODE CONTROLS:"));
    Serial.println(F("a: Audio react   d: Debug info"));
    Serial.println(F("l: Manual/auto   h: Show menu"));
    
    Serial.println(F("\n🔧 UTILITY COMMANDS:"));
    Serial.println(F("+: Speed up      -: Speed down"));
    Serial.println(F("s: Singing motion"));
    Serial.println(F("v: Version info"));
    
    Serial.println(F("\n💡 TIPS:"));
    Serial.println(F("- Start with basic movements (o, c, f, b)"));
    Serial.println(F("- Use 'a' to enable audio reactivity"));
    Serial.println(F("- Use 'l' to toggle manual/auto mode"));
    Serial.println(F("- Use 'p' to see current settings"));
    Serial.println(F("- Use 'r' to reset if something goes wrong"));
}

void printVersionInfo() {
    Serial.println(F("\n=== VERSION INFORMATION ==="));
    Serial.print(F("Firmware Version: "));
    Serial.println(FIRMWARE_VERSION_STRING);
    Serial.print(F("Build Date: "));
    Serial.println(F(__DATE__ " " __TIME__));
    Serial.print(F("Arduino Version: "));
    Serial.println(ARDUINO);
    Serial.print(F("Free RAM: "));
    Serial.print(freeMemory());
    Serial.println(F(" bytes"));
    Serial.println(F("============================="));
}

void initializeSystem(FishState& state, MotorCalibration& calibration) {
    // Initialize fish state with defaults
    state.state = STATE_WAITING;
    state.audioReactivityEnabled = true;
    state.manualMode = true;
    state.talking = false;
    state.soundVolume = 0;
    
    // Initialize calibration with defaults
    calibration.mouthOpenTime = DEFAULT_MOUTH_OPEN_TIME;
    calibration.mouthCloseTime = DEFAULT_MOUTH_CLOSE_TIME;
    calibration.bodyForwardTime = DEFAULT_BODY_FORWARD_TIME;
    calibration.bodyBackTime = DEFAULT_BODY_BACK_TIME;
    calibration.mouthSpeed = DEFAULT_SPEED;
    calibration.bodySpeed = DEFAULT_SPEED;
    
    DEBUG_PRINTLN("System initialized with default settings");
}

uint8_t calculateRampedSpeed(uint8_t currentSpeed, uint8_t targetSpeed, uint8_t rampStep) {
    if (currentSpeed < targetSpeed) {
        return constrainValue(currentSpeed + rampStep, currentSpeed, targetSpeed);
    } else if (currentSpeed > targetSpeed) {
        return constrainValue(currentSpeed - rampStep, targetSpeed, currentSpeed);
    }
    return currentSpeed;
}

// ============================================================================
// Memory Management Functions
// ============================================================================

#ifdef __arm__
// should use uinstd.h to define sbrk but Due causes a conflict
extern "C" char* sbrk(int i);
#else  // __ARM__
extern char *__brkval;
#endif  // __arm__

int freeMemory() {
    char top;
#ifdef __arm__
    return &top - reinterpret_cast<char*>(sbrk(0));
#else  // __arm__
    return __brkval ? &top - __brkval : &top - __malloc_heap_start;
#endif  // __arm__
}

// ============================================================================
// Template Specializations
// ============================================================================

// Explicit template instantiations for common types
template int constrainValue<int>(int value, int min, int max);
template long constrainValue<long>(long value, long min, long max);
template float constrainValue<float>(float value, float min, float max);
template double constrainValue<double>(double value, double min, double max);

template int mapValue<int>(int value, int inMin, int inMax, int outMin, int outMax);
template long mapValue<long>(long value, long inMin, long inMax, long outMin, long outMax);
template float mapValue<float>(float value, float inMin, float inMax, float outMin, float outMax);
template double mapValue<double>(double value, double inMin, double inMax, double outMin, double outMax);

template void debugPrintValue<int>(const char* message, int value);
template void debugPrintValue<long>(const char* message, long value);
template void debugPrintValue<float>(const char* message, float value);
template void debugPrintValue<double>(const char* message, double value);
template void debugPrintValue<const char*>(const char* message, const char* value);
template void debugPrintValue<String>(const char* message, String value);
