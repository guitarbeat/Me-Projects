# Hardware Setup Guide

This guide covers the common hardware setup for all Billy Bass projects.

## Required Components

### Essential Components
- **Arduino Board**: Uno, Nano, or Pro Mini (5V, 16MHz)
- **Big Mouth Billy Bass**: Original animatronic fish toy
- **Motor Drivers**: 2x MX1508 dual H-bridge modules
- **Power Supply**: 5V DC adapter (minimum 1A, 2A recommended)
- **Audio Input**: Microphone or sound sensor module
- **Breadboard**: For prototyping and connections
- **Jumper Wires**: Male-to-male and male-to-female

### Optional Components
- **LEDs**: For status indication
- **Resistors**: For LED current limiting
- **Capacitors**: For power supply filtering
- **Enclosure**: For final assembly

## Pin Assignments

### Standard Pin Configuration
| Pin | Function | Description |
|-----|----------|-------------|
| A0  | Audio Input | Analog input from microphone/sensor |
| D3  | Mouth Motor 2 | MX1508 driver input for mouth motor |
| D5  | Mouth Motor 1 | MX1508 driver input for mouth motor |
| D6  | Body Motor 1 | MX1508 driver input for body motor |
| D9  | Body Motor 2 | MX1508 driver input for body motor |

### Power Connections
- **Arduino VIN**: Connect to 5V power supply positive
- **Arduino GND**: Connect to power supply negative and all component grounds
- **MX1508 VCC**: Connect to 5V power supply positive
- **MX1508 GND**: Connect to power supply negative

## Wiring Instructions

### Step 1: Power Connections
1. Connect 5V power supply positive to Arduino VIN
2. Connect 5V power supply negative to Arduino GND
3. Connect 5V power supply positive to both MX1508 VCC pins
4. Connect 5V power supply negative to both MX1508 GND pins

### Step 2: Motor Connections
1. **Mouth Motor**:
   - Connect motor wires to MX1508 Driver 1 A+ and A- terminals
   - Connect Arduino D5 to MX1508 Driver 1 IN1
   - Connect Arduino D3 to MX1508 Driver 1 IN2

2. **Body Motor**:
   - Connect motor wires to MX1508 Driver 2 A+ and A- terminals
   - Connect Arduino D6 to MX1508 Driver 2 IN1
   - Connect Arduino D9 to MX1508 Driver 2 IN2

### Step 3: Audio Input
1. Connect microphone/sensor VCC to 5V
2. Connect microphone/sensor GND to GND
3. Connect microphone/sensor signal output to Arduino A0

### Step 4: Verify Connections
1. Double-check all power connections
2. Ensure all grounds are common
3. Verify motor driver connections
4. Test audio input with multimeter

## Power Requirements

### Minimum Requirements
- **Voltage**: 5V DC (±0.25V)
- **Current**: 1A continuous
- **Peak Current**: 2A (during motor startup)

### Recommended Power Supply
- **Voltage**: 5V DC regulated
- **Current**: 2A continuous
- **Type**: Switching power supply with good regulation
- **Connector**: 2.1mm barrel jack (Arduino compatible)

## Safety Considerations

### Electrical Safety
- Use only 5V power supplies
- Ensure proper polarity connections
- Use appropriate wire gauge (22 AWG minimum)
- Avoid short circuits

### Mechanical Safety
- Secure all connections
- Avoid pinching motor wires
- Use strain relief for external connections
- Test movements before final assembly

### Motor Protection
- Start with low speeds during testing
- Monitor motor temperature
- Use appropriate power supply capacity
- Implement software safety limits

## Testing Procedure

### Initial Power Test
1. Connect power supply
2. Verify Arduino powers on (LED should light)
3. Check voltage at Arduino VIN (should be ~5V)
4. Verify ground continuity

### Motor Test
1. Upload basic motor test sketch
2. Test each motor individually
3. Verify direction control
4. Check speed control

### Audio Test
1. Upload audio test sketch
2. Verify audio input reading
3. Test threshold detection
4. Calibrate sensitivity

## Troubleshooting

### Common Issues

#### No Power
- Check power supply connections
- Verify voltage output
- Check fuse/breaker
- Test with multimeter

#### Motors Not Moving
- Check motor driver connections
- Verify power supply capacity
- Check Arduino pin connections
- Test with simple motor sketch

#### Audio Not Working
- Check microphone connections
- Verify signal output
- Test with multimeter
- Check Arduino analog input

#### Erratic Behavior
- Check all connections
- Verify power supply stability
- Check for loose connections
- Test individual components

### Debugging Steps
1. Use serial monitor for debug output
2. Test each component individually
3. Check voltage levels
4. Verify continuity
5. Test with known good components

## Assembly Tips

### Breadboard Assembly
- Use color-coded wires for organization
- Keep power and signal wires separate
- Use appropriate wire lengths
- Label connections for reference

### Final Assembly
- Plan component placement
- Use appropriate mounting hardware
- Ensure good ventilation
- Protect from moisture
- Consider accessibility for adjustments

## Next Steps

After completing hardware setup:
1. Upload a test sketch
2. Verify all functions work
3. Calibrate motor timings
4. Test audio reactivity
5. Proceed to software development

For project-specific setup instructions, see the individual project documentation.
