/*
 * BTBillyBassTest.ino
 * 
 * This is a simple test file to verify that the motors for a Big Mouth Billy Bass
 * are connected correctly. It cycles through different movements for both the mouth
 * and body motors to help with troubleshooting.
 * 
 * Author: Aaron (via Claude)
 * Based on original work by Jordan Bunker <jordan@hierotechnics.com>
 */

#include <MX1508.h>

// Define the pins for the motors
// If these don't match your setup, adjust accordingly
MX1508 bodyMotor(6, 9);  // Body motor on pins 6 and 9
MX1508 mouthMotor(5, 3); // Mouth motor on pins 5 and 3

// Test sequence states
enum TestState {
  OPEN_MOUTH,
  CLOSE_MOUTH,
  RAISE_HEAD,
  LOWER_HEAD,
  PAUSE
};

TestState currentState = OPEN_MOUTH;
unsigned long stateStartTime = 0;
const int stateDuration = 1500; // Each state lasts 1.5 seconds

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  Serial.println("Billy Bass Motor Test");
  Serial.println("--------------------");
  
  // Initialize motors
  bodyMotor.setSpeed(0);
  mouthMotor.setSpeed(0);
  
  // Halt motors to ensure they're stopped
  bodyMotor.halt();
  mouthMotor.halt();
  
  stateStartTime = millis();
}

void loop() {
  // Check if it's time to change states
  if (millis() - stateStartTime >= stateDuration) {
    // Move to next state
    currentState = (TestState)((currentState + 1) % 5);
    stateStartTime = millis();
    
    // Stop motors between state changes
    bodyMotor.halt();
    mouthMotor.halt();
    delay(200); // Short pause between movements
  }
  
  // Execute the current state
  switch (currentState) {
    case OPEN_MOUTH:
      Serial.println("Testing: Opening mouth");
      mouthMotor.setSpeed(200);
      mouthMotor.forward();
      break;
      
    case CLOSE_MOUTH:
      Serial.println("Testing: Closing mouth");
      mouthMotor.setSpeed(180);
      mouthMotor.backward();
      break;
      
    case RAISE_HEAD:
      Serial.println("Testing: Raising head/body");
      bodyMotor.setSpeed(200);
      bodyMotor.forward();
      break;
      
    case LOWER_HEAD:
      Serial.println("Testing: Lowering head/raising tail");
      bodyMotor.setSpeed(200);
      bodyMotor.backward();
      break;
      
    case PAUSE:
      Serial.println("Testing: Pause (all motors stopped)");
      bodyMotor.halt();
      mouthMotor.halt();
      break;
  }
} 