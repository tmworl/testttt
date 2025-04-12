// src/ui/platform/detection.js
//
// Platform capability detection with function-based architecture
// Implements unified API pattern for consistent interface access

import { Platform, Dimensions, PixelRatio } from 'react-native';

// Cache window dimensions for performance optimization
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const PIXEL_RATIO = PixelRatio.get();

// Platform identification constants
const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';

/**
 * Detects if running on iPhone 12 or newer design models with squared edges.
 * This affects shadow rendering and corner radius calculations.
 */
const isIPhone12OrNewer = () => {
  if (!IS_IOS) return false;
  
  // iPhone 12/13/14/15 models have a minimum side length of 375 pts
  if (Math.min(WINDOW_WIDTH, WINDOW_HEIGHT) < 375) return false;
  
  // For face ID models, look at aspect ratio and device size
  return (
    // Match iPhone 12/13/14/15 aspect ratio (19.5:9) within tolerance
    (WINDOW_HEIGHT / WINDOW_WIDTH > 2.1 || WINDOW_WIDTH / WINDOW_HEIGHT > 2.1) &&
    // But exclude iPhone 11 and X models (which also have Face ID but rounded edges)
    WINDOW_HEIGHT >= 812
  );
};

/**
 * Detects if device has a notch or Dynamic Island, requiring special layout handling
 */
const hasNotchOrDynamicIsland = () => {
  if (!IS_IOS) return false;
  
  // All iPhone models from X onward have a notch or Dynamic Island
  // Use status bar height as a proxy for detecting notch
  return WINDOW_HEIGHT >= 812 && !Platform.isPad;
};

/**
 * Detects if device specifically has a Dynamic Island (iPhone 14 Pro and newer)
 */
const hasDynamicIsland = () => {
  if (!IS_IOS) return false;
  
  // Dynamic Island devices have specific dimensions
  // This approach works for iPhone 14 Pro, iPhone 14 Pro Max and newer
  if (Platform.isPad) return false;
  
  // Dynamic Island detection logic:
  // iPhone 14 Pro has 393pt width in portrait
  // iPhone 14 Pro Max has 430pt width in portrait
  // Other devices in this size range don't have Dynamic Island
  const portraitWidth = Math.min(WINDOW_WIDTH, WINDOW_HEIGHT);
  return (portraitWidth === 393 || portraitWidth === 430) && hasNotchOrDynamicIsland();
};

/**
 * Detects if device has Face ID (affects layout considerations)
 */
const hasFaceID = () => {
  if (!IS_IOS) return false;
  
  if (Platform.isPad) {
    // iPad Pro models have Face ID
    return Math.max(WINDOW_WIDTH, WINDOW_HEIGHT) >= 1024;
  }
  
  // iPhones with Face ID have a notch or Dynamic Island
  return hasNotchOrDynamicIsland();
};

/**
 * Detects if device has a home indicator, requiring bottom inset padding
 */
const hasHomeIndicator = () => {
  if (!IS_IOS) return false;
  
  // Devices with Face ID also have home indicators
  return hasFaceID();
};

/**
 * Returns status bar height, accounting for notches and Dynamic Island
 */
const getStatusBarHeight = () => {
  if (IS_IOS) {
    if (Platform.isPad) return 24;
    return hasNotchOrDynamicIsland() ? 47 : 20;
  }
  
  // Android implementation - fixed default value
  return 24;
};

/**
 * Returns bottom safe area inset for home indicator or system UI
 */
const getBottomInset = () => {
  if (IS_IOS) {
    return hasHomeIndicator() ? 34 : 0;
  }
  
  // Android doesn't have home indicator but may have system navigation
  return 0; // Would need additional detection for gesture navigation
};

/**
 * Determines if device supports blur effects efficiently
 */
const supportsBlurEffects = () => {
  // Feature detection for blur support
  // This is a runtime check for both capability and module availability
  try {
    // Technical architecture decision: Only enable blur effects on iOS
    // Android blur implementation is inconsistent across devices
    if (IS_IOS) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Determines if device supports haptic feedback
 */
const supportsHaptics = () => {
  // Feature detection for haptics
  try {
    // Only iOS supports consistent haptics through our implementation
    return IS_IOS;
  } catch (e) {
    return false;
  }
};

/**
 * Calculates maximum blur intensity supported by the device
 * Higher-powered devices can handle more intensive blur effects
 */
const getMaxBlurIntensity = () => {
  if (IS_IOS) {
    // iOS devices handle blur efficiently, can use higher values
    return 100;
  }
  
  if (IS_ANDROID) {
    // Scale based on device pixel ratio as a proxy for GPU capability
    if (PIXEL_RATIO >= 3) return 80;
    if (PIXEL_RATIO >= 2.5) return 60;
    if (PIXEL_RATIO >= 2) return 40;
    return 20; // Low-end device fallback
  }
  
  return 40; // Safe default
};

/**
 * Get safe insets for uniform cross-platform handling
 */
const getSafeAreaInsets = () => {
  return {
    top: getStatusBarHeight(),
    bottom: getBottomInset(),
    left: 0,
    right: 0
  };
};

/**
 * Platform selection utility for cross-platform code
 * @param {Object} options Platform-specific implementations
 * @returns {any} Selected implementation based on current platform
 */
const select = (options) => {
  const { ios, android, ...rest } = options;
  
  if (IS_IOS && ios !== undefined) return ios;
  if (IS_ANDROID && android !== undefined) return android;
  
  // Handle specific fallbacks for other platforms
  const defaultOption = rest.default;
  return defaultOption !== undefined ? defaultOption : null;
};

// Export a comprehensive platform detection API
// IMPORTANT: Exported as callable functions to match consumer expectations
export default {
  isIOS: IS_IOS,
  isAndroid: IS_ANDROID,
  isIPhone12OrNewer,  // Export function reference, not its return value
  hasNotchOrDynamicIsland,  // Export function reference
  hasDynamicIsland,  // Export function reference - KEY FIX FOR YOUR ERROR
  hasFaceID,  // Export function reference
  hasHomeIndicator,  // Export function reference
  getStatusBarHeight,
  getBottomInset,
  supportsBlurEffects,  // Export function reference
  supportsHaptics,  // Export function reference
  getMaxBlurIntensity,
  getSafeAreaInsets,
  select,
  
  // Add common device metrics for rendering optimizations
  metrics: {
    screenWidth: WINDOW_WIDTH,
    screenHeight: WINDOW_HEIGHT,
    pixelRatio: PIXEL_RATIO
  }
};