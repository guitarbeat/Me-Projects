# BTBillyBass Technical Documentation

> Note: A concise overview now lives in `docs/technical-overview.md`. This file contains the extended technical reference.

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Hardware Interface](#hardware-interface)
3. [Software Architecture](#software-architecture)
4. [State Machine Design](#state-machine-design)
5. [Motor Control System](#motor-control-system)
6. [Audio Processing](#audio-processing)
7. [Safety Mechanisms](#safety-mechanisms)
8. [Calibration System](#calibration-system)
9. [Serial Communication Protocol](#serial-communication-protocol)
10. [Development Guidelines](#development-guidelines)
11. [Troubleshooting Guide](#troubleshooting-guide)

## Project Architecture

### Overview
BTBillyBass is a modular Arduino project that transforms a Big Mouth Billy Bass animatronic fish into an interactive, audio-reactive device. The project follows a layered architecture pattern with clear separation of concerns.

### Directory Structure
```
BTBillyBass/
├── BTBillyBass.ino          # Main Arduino sketch
├── README.md                # User documentation
├── TECHNICAL_DOCS.md        # This technical documentation
├── src/
│   ├── core/               # Core application logic
│   │   ├── BillyBass.h     # High-level fish control interface
│   │   ├── BillyBass.cpp   # Implementation of fish control
│   │   ├── Config.h        # Configuration constants and structures
│   │   ├── StateMachine.h  # State machine interface
│   │   └── StateMachine.cpp # State machine implementation
│   ├── drivers/            # Hardware abstraction layer
│   │   ├── BillyBassMotor.h # Motor control interface
│   │   └── BillyBassMotor.cpp # Motor control implementation
│   └── utils/              # Utility functions
│       └── Debug.h         # Debug utilities
├── libraries/              # External libraries
└── memory-bank/            # Project memory files
```

## Hardware Interface

### Pin Configuration
| Pin | Function | Description |
|-----|----------|-------------|
| A0  | Audio Input | Analog input from microphone or sound sensor |
| D3  | Mouth Motor 2 | MX1508 driver input for mouth motor |
| D5  | Mouth Motor 1 | MX1508 driver input for mouth motor |
| D6  | Body Motor 1 | MX1508 driver input for body motor |
| D9  | Body Motor 2 | MX1508 driver input for body motor |

### Motor Driver Configuration
The project uses MX1508 dual H-bridge motor drivers for controlling the DC motors:

- **Mouth Motor**: Controls jaw opening/closing mechanism
- **Body Motor**: Controls body/tail movement

### Audio Input
- **Type**: Analog input (0-5V)
- **Source**: Microphone or sound sensor
- **Processing**: Direct ADC reading with threshold-based detection

## Software Architecture

### Design Patterns
1. **Layered Architecture**: Clear separation between hardware abstraction, business logic, and application layers
2. **State Machine Pattern**: Manages fish behavior states
3. **Command Pattern**: Handles serial command processing
4. **Observer Pattern**: Audio reactivity system

### Core Components

#### 1. BillyBass Class (`src/core/BillyBass.h`)
**Purpose**: High-level interface for fish control
**Responsibilities**:
- Coordinate motor movements
- Execute complex movement sequences
- Manage audio-reactive behavior
- Provide calibration interface

**Key Methods**:
```cpp
void openMouth();           // Basic mouth control
void closeMouth();
void flapTail();            // Basic body control
void bodyForward();
void singingMotion();       // Complex sequences
void resetMotorsToHome();   // Safety operations
```

#### 2. BillyBassMotor Class (`src/drivers/BillyBassMotor.h`)
**Purpose**: Hardware abstraction for motor control
**Responsibilities**:
- Direct motor driver control
- Safety mechanism enforcement
- Speed ramping and smooth control
- State tracking

**Key Features**:
- Automatic safety checks
- Cooldown management
- Emergency stop capability
- Speed ramping for smooth operation

#### 3. State Machine (`src/core/StateMachine.h`)
**Purpose**: Manage fish behavior states
**States**:
- `STATE_WAITING`: Idle state
- `STATE_TALKING`: Audio-reactive mode
- `STATE_FLAPPING`: Performing movements

## State Machine Design

### State Transitions
```
[WAITING] --audio detected--> [TALKING] --silence--> [WAITING]
[WAITING] --idle timeout--> [FLAPPING] --complete--> [WAITING]
[TALKING] --manual command--> [WAITING]
```

### State Implementation
Each state has associated:
- Entry actions
- Exit actions
- State-specific behavior
- Transition conditions

### State Variables
```cpp
struct FishState {
    uint8_t state;                  // Current state
    bool audioReactivityEnabled;    // Mode setting
    bool manualMode;                // Control mode
    bool talking;                   // Activity flag
    uint16_t soundVolume;           // Audio level
};
```

## Motor Control System

### Safety Features
1. **Maximum Run Time**: 500ms continuous operation limit
2. **Cooldown Period**: 1000ms rest between operations
3. **Consecutive Move Limit**: Maximum 5 consecutive movements
4. **Speed Limiting**: Maximum 180/255 speed for safety
5. **Emergency Stop**: Immediate halt capability

### Movement Calibration
```cpp
struct MovementCalibration {
    uint16_t mouthOpenTime = 400;    // Timing for mouth open
    uint16_t mouthCloseTime = 400;   // Timing for mouth close
    uint16_t bodyForwardTime = 600;  // Timing for body forward
    uint16_t bodyBackTime = 600;     // Timing for body return
    uint8_t mouthSpeed = 150;        // Speed for mouth movements
    uint8_t bodySpeed = 120;         // Speed for body movements
};
```

### Speed Ramping
- **Ramp Time**: 100ms for smooth acceleration/deceleration
- **Purpose**: Reduces mechanical stress and provides natural movement
- **Implementation**: Gradual PWM duty cycle changes

## Audio Processing

### Audio Input Processing
1. **Analog Reading**: Direct ADC reading from A0
2. **Threshold Detection**: Compare against `SILENCE_THRESHOLD`
3. **Volume Tracking**: Store current volume level
4. **State Updates**: Trigger state machine transitions

### Audio-Reactive Behavior
- **Mouth Movement**: Synchronized with audio levels
- **Body Articulation**: Natural body language during speech
- **Timing Coordination**: Coordinated mouth and body movements

## Safety Mechanisms

### Motor Protection
1. **Overheating Prevention**: Maximum run time limits
2. **Mechanical Stress Reduction**: Speed ramping and cooldowns
3. **Emergency Override**: Force stop capability
4. **Position Tracking**: State-based movement validation

### System Safety
1. **Input Validation**: All serial commands validated
2. **Range Checking**: Speed and timing values constrained
3. **State Consistency**: State machine prevents invalid transitions
4. **Error Recovery**: Automatic reset capabilities

## Calibration System

### Calibration Parameters
- **Timing**: Movement duration for each motor
- **Speed**: Motor speed for different movements
- **Thresholds**: Audio sensitivity settings

### Calibration Commands
```
t: Set mouth timing (open,close)
y: Set body timing (forward,back)
m: Set mouth speed
n: Set body speed
p: Print current settings
```

### Calibration Process
1. **Initial Setup**: Use default values
2. **Basic Testing**: Test each movement individually
3. **Fine Tuning**: Adjust timing and speed as needed
4. **Validation**: Test complete sequences

## Serial Communication Protocol

### Command Format
- **Single Character Commands**: Most commands use single characters
- **Numeric Input**: Some commands require numeric parameters
- **Baud Rate**: 9600 baud for compatibility

### Command Categories

#### Movement Commands
```
o: Open mouth
c: Close mouth
f: Flap tail
b: Body forward
r: Reset position
s: Singing motion
```

#### Calibration Commands
```
t: Mouth timing setup
y: Body timing setup
m: Mouth speed setup
n: Body speed setup
p: Print settings
```

#### Mode Commands
```
a: Toggle audio reactivity
l: Toggle manual/auto mode
d: Toggle debug mode
h: Show help
```

### Response Format
- **Status Messages**: Human-readable status updates
- **Emoji Support**: Visual feedback with emoji characters
- **Error Messages**: Clear error descriptions
- **Debug Output**: Detailed information in debug mode

## Development Guidelines

### Code Style
1. **Naming Conventions**:
   - Classes: PascalCase (`BillyBass`)
   - Methods: camelCase (`openMouth()`)
   - Constants: UPPER_SNAKE_CASE (`MAX_SPEED`)
   - Variables: camelCase with underscore prefix for private (`_motorSpeed`)

2. **Documentation**:
   - All public methods must have Doxygen-style documentation
   - Include `@param`, `@return`, `@see` tags where appropriate
   - Provide usage examples for complex methods

3. **Error Handling**:
   - Validate all inputs
   - Provide meaningful error messages
   - Implement graceful degradation

### Adding New Features
1. **Hardware Abstraction**: Add new hardware interfaces in `drivers/`
2. **Business Logic**: Add new features in `core/`
3. **Configuration**: Add new constants in `Config.h`
4. **Documentation**: Update this file and README.md

### Testing Guidelines
1. **Unit Testing**: Test individual components
2. **Integration Testing**: Test component interactions
3. **Hardware Testing**: Test with actual hardware
4. **Safety Testing**: Verify safety mechanisms

## Troubleshooting Guide

### Common Issues

#### Motor Not Moving
**Symptoms**: Motors don't respond to commands
**Possible Causes**:
- Incorrect pin connections
- Motor driver not powered
- Safety mechanisms blocking movement
- Calibration values too low

**Solutions**:
1. Check pin connections
2. Verify power supply to motor drivers
3. Check debug output for safety messages
4. Increase speed/timing values

#### Erratic Movement
**Symptoms**: Motors move unexpectedly or inconsistently
**Possible Causes**:
- Loose mechanical connections
- Incorrect calibration values
- Electrical interference
- Power supply issues

**Solutions**:
1. Tighten mechanical connections
2. Recalibrate timing and speed
3. Check for electrical interference
4. Verify stable power supply

#### Audio Not Detected
**Symptoms**: Fish doesn't respond to audio
**Possible Causes**:
- Microphone not connected
- Audio threshold too high
- Audio reactivity disabled
- Hardware failure

**Solutions**:
1. Check microphone connections
2. Lower audio threshold
3. Enable audio reactivity (`a` command)
4. Test microphone with multimeter

#### Serial Communication Issues
**Symptoms**: Commands not recognized
**Possible Causes**:
- Wrong baud rate
- Serial monitor not open
- Command format error
- Buffer overflow

**Solutions**:
1. Set baud rate to 9600
2. Open Serial Monitor
3. Check command format
4. Clear serial buffer

### Debug Mode
Enable debug mode with `d` command to get detailed information:
- Motor state information
- Safety check results
- Timing data
- State machine transitions

### Emergency Procedures
1. **Emergency Stop**: Use `r` command to reset all motors
2. **Power Cycle**: Disconnect and reconnect power
3. **Factory Reset**: Re-upload sketch to restore defaults
4. **Manual Override**: Use `forceMove()` in code if needed

### Performance Optimization
1. **Reduce Debug Output**: Set `DEBUG` to 0 in production
2. **Optimize Timing**: Fine-tune movement durations
3. **Power Management**: Use appropriate power supply
4. **Memory Usage**: Monitor memory usage in complex sequences

---

*This documentation is maintained as part of the BTBillyBass project. For questions or contributions, please refer to the project repository.*