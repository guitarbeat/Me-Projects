/*
 * Alexa-Enabled Big Mouth Billy Bass - Serial Monitor Version
 * =========================================================
 * Simplified version that only performs audio analysis and outputs to Serial monitor.
 * - Monitors high frequencies (vocals) and low frequencies (bass)
 * - Detects beats and analyzes audio characteristics
 * - Outputs all data to serial monitor for debugging/visualization
 * 
 * Hardware: A0 (audio input)
 * Credits: Donald Bell, jswett77, Jordan Bunker
 * License: MIT
 */

#include "arduinoFFT.h"

// ==================== CONFIGURATION ====================
// Audio Processing Configuration
struct {
  // FFT Settings
  const uint16_t SAMPLES = 64;             // FFT sample size (power of 2)
  const uint16_t SAMPLING_FREQUENCY = 1000; // Sampling frequency in Hz
  
  // Frequency Thresholds
  const uint8_t SILENCE_THRESHOLD = 10;    // Threshold for detecting silence
  const uint8_t HIGH_FREQ_THRESHOLD = 5;   // Threshold for high frequencies (vocals)
  const uint8_t LOW_FREQ_THRESHOLD = 8;    // Threshold for low frequencies (bass)
  const uint8_t BEAT_THRESHOLD = 8;        // Threshold for beat detection
  const uint8_t MAX_SOUND_VOLUME = 100;    // Maximum expected sound volume
  
  // Frequency Bands
  const uint8_t LOW_FREQ_CUTOFF = 5;       // Upper limit for low frequency band
  const uint8_t HIGH_FREQ_START = 6;       // Lower limit for high frequency band
} audio;

// Behavior Configuration
struct {
  // Timing (milliseconds)
  const uint16_t BEAT_COOLDOWN_MS = 150;   // Minimum time between beat responses
  const uint8_t CONSECUTIVE_QUIET_THRESHOLD = 5;  // Frames of quiet before random actions
} behavior;

// ==================== GLOBAL VARIABLES ====================
// FFT
double vReal[64], vImag[64]; 
ArduinoFFT<double> FFT = ArduinoFFT<double>(vReal, vImag, 64, 1000);

// Audio Analysis
int highFreqMagnitude = 0, lowFreqMagnitude = 0, lastLowMag = 0, soundVolume = 0;
bool beatDetected = false;
int consecutiveQuietFrames = 0;

// Timing
unsigned long currentTime = 0, lastFFTTime = 0, lastBeatTime = 0;

// ==================== SETUP & MAIN LOOP ====================
void setup() {
  pinMode(A0, INPUT);
  Serial.begin(9600);
  Serial.println("BTBillyBass Serial Monitor initialized. Waiting for audio input...");
}

void loop() {
  currentTime = millis();
  if (currentTime - lastFFTTime > 100) {
    performFFTAnalysis();
    lastFFTTime = currentTime;
  }
  
  // Print status information about what would have happened
  if (beatDetected) {
    Serial.println("BEAT DETECTED!");
  }
  
  if (consecutiveQuietFrames > behavior.CONSECUTIVE_QUIET_THRESHOLD && random(100) < 10) {
    Serial.println("RANDOM FLAP WOULD HAPPEN!");
    consecutiveQuietFrames = 0;
  }
  
  if (highFreqMagnitude > audio.HIGH_FREQ_THRESHOLD) {
    Serial.print("MOUTH MOVEMENT - High freq magnitude: ");
    Serial.println(highFreqMagnitude);
  }
  
  if (lowFreqMagnitude > audio.LOW_FREQ_THRESHOLD) {
    Serial.print("BODY MOVEMENT - Low freq magnitude: ");
    Serial.println(lowFreqMagnitude);
    
    if (lowFreqMagnitude > audio.LOW_FREQ_THRESHOLD + 15 && random(100) < 40) {
      Serial.println("BASS-TRIGGERED FLAP!");
    }
  }
}

// ==================== AUDIO ANALYSIS ====================
void performFFTAnalysis() {
  // Sample audio input
  for (int i = 0; i < audio.SAMPLES; i++) {
    vReal[i] = analogRead(A0);
    vImag[i] = 0;
    delayMicroseconds(1000000/audio.SAMPLING_FREQUENCY);
  }

  // Process FFT
  FFT.windowing(FFT_WIN_TYP_HAMMING, FFT_FORWARD);
  FFT.compute(FFT_FORWARD);
  FFT.complexToMagnitude();

  // Calculate frequency bands
  lowFreqMagnitude = highFreqMagnitude = 0;
  int lowBandCount = 0, highBandCount = 0;
  
  for (int i = 1; i < audio.LOW_FREQ_CUTOFF; i++) {
    lowFreqMagnitude += vReal[i];
    lowBandCount++;
  }
  lowFreqMagnitude = lowBandCount > 0 ? lowFreqMagnitude / lowBandCount : 0;
  
  for (int i = audio.HIGH_FREQ_START; i < audio.SAMPLES/2; i++) {
    highFreqMagnitude += vReal[i];
    highBandCount++;
  }
  highFreqMagnitude = highBandCount > 0 ? highFreqMagnitude / highBandCount : 0;

  // Beat detection
  static int lastHighMag = 0;
  beatDetected = (lowFreqMagnitude > audio.LOW_FREQ_THRESHOLD && 
                 (lowFreqMagnitude > (lastLowMag * 1.3) || lowFreqMagnitude > audio.BEAT_THRESHOLD * 2) &&
                 currentTime - lastBeatTime > behavior.BEAT_COOLDOWN_MS);
  
  if (beatDetected) {
    lastBeatTime = currentTime;
  }

  // Track quiet periods & apply smoothing
  consecutiveQuietFrames = (lowFreqMagnitude < audio.LOW_FREQ_THRESHOLD && highFreqMagnitude < audio.HIGH_FREQ_THRESHOLD) ? 
                           consecutiveQuietFrames + 1 : 0;
  
  lowFreqMagnitude = (lowFreqMagnitude * 0.7) + (lastLowMag * 0.3);
  highFreqMagnitude = (highFreqMagnitude * 0.7) + (lastHighMag * 0.3);
  lastLowMag = lowFreqMagnitude;
  lastHighMag = highFreqMagnitude;
  
  soundVolume = max(lowFreqMagnitude, highFreqMagnitude);
  
  // Debug output - this is the main serial monitoring component
  Serial.print("Low: ");
  Serial.print(lowFreqMagnitude);
  Serial.print(" | High: ");
  Serial.println(highFreqMagnitude);
}