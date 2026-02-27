# Enhanced Debug System

This document describes the comprehensive debugging system built into the Flo and Tell application.

## Overview

The debug system provides real-time monitoring, logging, and visualization tools to help developers understand and troubleshoot the application's behavior, especially the floating bubbles physics and user interactions.

## Features

### 🔬 Debug Panel

- **Real-time Performance Metrics**: FPS, memory usage, bubble count, network requests, error count
- **Component State Inspection**: View the current state of all registered components
- **Live Logging**: See recent log entries with color-coded severity levels
- **Quick Actions**: Clear logs, export debug data, toggle physics visualization

### 📊 Performance Monitoring

- **FPS Tracking**: Real-time frame rate monitoring
- **Memory Usage**: JavaScript heap size monitoring (when available)
- **Network Request Tracking**: Monitor API calls with timing and status codes
- **Error Counting**: Track and categorize errors

### 🎯 Component State Inspector

- **Real-time State**: View component state changes as they happen
- **Registration System**: Components automatically register their state
- **Historical Tracking**: See state changes over time

### 🎨 Visual Debugging

- **Physics Visualization**: See collision boundaries and velocity vectors
- **Collision Detection**: Visual representation of bubble interactions
- **Container Boundaries**: See the clipping area for bubbles

### ⌨️ Keyboard Shortcuts

- `Ctrl+Shift+D`: Toggle debug panel
- `Ctrl+Shift+P`: Show performance snapshot
- `Ctrl+Shift+L`: Show recent logs
- `Ctrl+Shift+C`: Clear all debug data

## Usage

### Basic Debug Panel

The debug panel can be toggled using:

1. The floating debug button (🔬) in the bottom-right corner
2. Keyboard shortcut `Ctrl+Shift+D`

### Component Registration

Components automatically register their state for debugging:

```typescript
import { componentInspector } from '@/lib/devTools';

// In your component
useEffect(() => {
  componentInspector.registerComponent('MyComponent', {
    state: myState,
    props: myProps,
    lastUpdated: new Date().toISOString(),
  });
}, [myState, myProps]);
```

### Logging

Use the enhanced logger for better debugging:

```typescript
import { debugLogger } from '@/lib/devTools';

// Different log levels
debugLogger.log('Info message', data, 'info');
debugLogger.log('Warning message', data, 'warn');
debugLogger.log('Error message', data, 'error');
debugLogger.log('Debug message', data, 'debug');
```

### Network Monitoring

Track network requests automatically:

```typescript
import { networkMonitor } from '@/lib/devTools';

// Track a request
const startTime = performance.now();
const response = await fetch('/api/data');
const duration = performance.now() - startTime;

networkMonitor.trackRequest('/api/data', 'GET', response.status, duration);
```

### Physics Debugging

Enable visual physics debugging:

```typescript
import { debugFlags } from '@/lib/devTools';

// Toggle physics visualization
debugFlags.toggle('showCollisionBoundaries');
```

## Debug Panel Interface

### Performance Section

- **FPS**: Current frames per second
- **Memory**: JavaScript heap usage in MB
- **Bubbles**: Number of active floating bubbles
- **Network**: Number of tracked network requests
- **Errors**: Number of errors logged

### Component States

Shows real-time state of all registered components:

- Component name
- Current state snapshot
- Last update timestamp

### Recent Logs

Color-coded log entries:

- 🟢 **Info**: General information
- 🟡 **Warn**: Warnings and non-critical issues
- 🔴 **Error**: Errors and exceptions
- 🔵 **Debug**: Detailed debugging information

### Quick Actions

- **Clear**: Clear all logs and reset counters
- **Export**: Download debug data as JSON file
- **Toggle Physics**: Enable/disable physics visualization

## Debug Data Export

The debug system can export comprehensive data including:

- Performance metrics over time
- All log entries with timestamps
- Network request history
- Component state snapshots
- Error details and stack traces

Export format: `debug-export-{timestamp}.json`

## Development vs Production

The debug system is completely disabled in production builds:

- All debug code is wrapped in `import.meta.env.DEV` checks
- No performance impact in production
- Debug tools are tree-shaken out of production bundles

## Integration Points

### FloatingUserBubbles Component

- Logs bubble initialization and physics updates
- Registers component state for inspection
- Provides physics visualization overlay

### useExistingUsers Hook

- Tracks network requests to Supabase
- Logs profile fetching and state updates
- Monitors error conditions

### Auth Component

- Logs authentication attempts
- Tracks user profile loading
- Monitors form interactions

## Troubleshooting

### Debug Panel Not Showing

1. Ensure you're in development mode (`npm run dev`)
2. Check browser console for initialization errors
3. Try keyboard shortcut `Ctrl+Shift+D`

### Performance Issues

1. Check FPS in debug panel
2. Monitor memory usage trends
3. Look for excessive logging or component re-renders

### Missing Logs

1. Verify component is using `debugLogger`
2. Check log level filtering
3. Ensure debug panel is visible

### Physics Visualization Not Working

1. Enable collision boundaries: `debugFlags.toggle('showCollisionBoundaries')`
2. Check that bubbles are active
3. Verify canvas rendering

## Best Practices

1. **Use Appropriate Log Levels**: Don't log everything as 'info'
2. **Register Component State**: Help with debugging by registering meaningful state
3. **Monitor Performance**: Keep an eye on FPS and memory usage
4. **Export Debug Data**: Save debug data when investigating issues
5. **Clear Regularly**: Clear debug data to avoid memory leaks

## Future Enhancements

- [ ] Timeline view of component state changes
- [ ] Network request waterfall visualization
- [ ] Custom debug breakpoints
- [ ] Performance profiling tools
- [ ] Automated error reporting
- [ ] Debug data persistence across sessions
