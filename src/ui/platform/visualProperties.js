// src/ui/platform/visualProperties.js
//
// Visual property definitions with computation rules
// Defines the mathematical foundation for iOS 18's visual language

import { Platform } from 'react-native';
import platformDetection from './detection';
import theme from '../theme';

/**
 * Corner Radius Calculation
 * 
 * iOS 18 uses a dynamic corner radius system based on container size.
 * Small components use tight corners, while larger containers use more generous rounding.
 * This system ensures consistent visual harmony across different component scales.
 */
const getCornerRadius = (size, variant = 'standard') => {
  // Base size represents the reference dimension for radius calculation
  const baseSize = Math.min(size.width || 0, size.height || 0);
  
  if (baseSize === 0) {
    // Fallback to predefined values when size is unknown
    const fallbackMap = {
      'small': 4,
      'standard': 8,
      'large': 12,
      'pill': 20
    };
    return fallbackMap[variant] || 8;
  }
  
  // Scale factor determines how aggressively radius changes with size
  let scaleFactor;
  let baseRadius;
  
  // Define different radius scaling strategies by variant
  switch (variant) {
    case 'small':
      baseRadius = 4;
      scaleFactor = 0.08;
      break;
    case 'large':
      baseRadius = 16;
      scaleFactor = 0.12;
      break;
    case 'pill':
      // Pill shape should be half the smallest dimension
      return baseSize / 2;
    case 'standard':
    default:
      baseRadius = 10;
      scaleFactor = 0.1;
      break;
  }
  
  // Apply platform-specific adjustments
  if (platformDetection.isIOS) {
    // iOS 18 specific adjustments
    if (platformDetection.isIPhone12OrNewer) {
      // Newer iPhones use slightly more pronounced corners
      scaleFactor *= 1.2;
    }
  } else if (platformDetection.isAndroid) {
    // Android will use M3 adjustments in the future
    scaleFactor *= 0.75; // Currently more subtle corners on Android
  }
  
  // Compute radius with a logarithmic scale that plateaus for larger sizes
  // This prevents corners from becoming too large on bigger containers
  const computedRadius = baseRadius + Math.log10(Math.max(100, baseSize)) * baseSize * scaleFactor * 0.05;
  
  // Apply constraints to keep radius in reasonable bounds
  const minRadius = baseRadius / 2;
  const maxRadius = baseSize * 0.25; // Never more than 1/4 of smallest dimension
  
  return Math.max(minRadius, Math.min(computedRadius, maxRadius));
};

/**
 * Shadow Parameter Generation
 * 
 * iOS 18 uses physically accurate shadows based on elevation.
 * Higher elevation increases blur radius, offset, and reduces opacity.
 * 
 * @param {number} elevation Z-index elevation value (0-24)
 * @returns {Object} Shadow parameters for React Native
 */
const getShadowParams = (elevation = 1) => {
  // Normalize elevation to a 0-24 scale
  const normalizedElevation = Math.max(0, Math.min(24, elevation));
  
  // Define base shadow parameters
  let shadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: platformDetection.isAndroid ? normalizedElevation : undefined
  };
  
  // No shadow for zero elevation
  if (normalizedElevation === 0) return shadow;
  
  // iOS-specific shadow calculation
  if (platformDetection.isIOS) {
    // Calculate physically-based shadow parameters
    // Higher elevation = larger radius, larger offset, lower opacity
    
    // Blur radius grows exponentially with elevation
    const shadowRadius = Math.pow(normalizedElevation, 0.7) * 0.8;
    
    // Offset grows with elevation but plateaus
    const offsetFactor = Math.min(normalizedElevation / 8, 1);
    const shadowOffset = {
      width: 0,
      height: normalizedElevation * offsetFactor
    };
    
    // Opacity is higher for lower elevations and reduces as elevation increases
    // This simulates light diffusion over distance
    const shadowOpacity = 0.18 - (normalizedElevation / 100);
    
    shadow = {
      shadowColor: '#000',
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    };
  }
  
  return shadow;
};

/**
 * Typography Optical Size Calculator
 * 
 * Calculates optical adjustments for typography based on size and weight.
 * iOS 18 uses SF Pro's optical size features for improved typography.
 * 
 * @param {number} fontSize Base font size
 * @param {string} weight Font weight (normal, medium, semibold, bold)
 * @returns {Object} Optically adjusted typography properties
 */
const getOpticalTypography = (fontSize, weight = 'normal') => {
  // Map logical weights to numerical values for calculations
  const weightMap = {
    normal: '400',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };
  
  // Convert string weight to numerical value
  const numericWeight = weightMap[weight] || weight || '400';
  
  // Define optical size adjustments
  // As size increases, character spacing (tracking) decreases
  // iOS 18 uses tighter tracking for larger text
  let tracking = 0;
  
  if (fontSize < 14) {
    tracking = 0.5; // Looser tracking for small text
  } else if (fontSize < 20) {
    tracking = 0.2; // Standard tracking for body text
  } else if (fontSize < 34) {
    tracking = 0; // Neutral tracking for subheadings
  } else {
    tracking = -0.5; // Tighter tracking for headlines
  }
  
  // Adjust tracking based on weight
  // Heavier weights need slightly looser tracking
  if (numericWeight >= '600') {
    tracking += 0.1;
  }
  
  // Calculate line height based on font size
  // iOS 18 uses tighter line heights for larger text
  let lineHeight;
  
  if (fontSize < 14) {
    lineHeight = fontSize * 1.3; // More space for small text
  } else if (fontSize < 20) {
    lineHeight = fontSize * 1.25; // Standard body text
  } else if (fontSize < 34) {
    lineHeight = fontSize * 1.2; // Subheadings
  } else {
    lineHeight = fontSize * 1.1; // Headlines
  }
  
  // iOS 18-specific optical adjustments
  const letterSpacing = tracking;
  
  return {
    fontSize,
    fontWeight: numericWeight,
    letterSpacing,
    lineHeight: Math.round(lineHeight),
    // Include platform-specific font family if needed
    fontFamily: Platform.select({
      ios: undefined, // System font on iOS
      android: 'Roboto', // Roboto on Android
      default: undefined,
    })
  };
};

/**
 * Blur Intensity Mapping
 * 
 * Maps semantic blur intensities to actual blur amounts based on device capability
 * 
 * @param {string} intensity Semantic intensity (subtle, light, regular, heavy)
 * @returns {number} Device-optimized blur amount
 */
const getBlurIntensity = (intensity = 'regular') => {
  // Define base intensity values
  const intensityMap = {
    subtle: 10,
    light: 25,
    regular: 50,
    heavy: 80
  };
  
  // Get base intensity or use regular as default
  const baseIntensity = intensityMap[intensity] || intensityMap.regular;
  
  // Scale based on device capabilities
  const deviceCapability = platformDetection.getMaxBlurIntensity();
  const scaleFactor = deviceCapability / 100;
  
  // Calculate final intensity with capability adjustment
  return Math.round(baseIntensity * scaleFactor);
};

/**
 * Color Computation 
 * 
 * Derives dynamic colors for material backgrounds based on context
 * 
 * @param {string} baseColor Base color in hex format
 * @param {number} opacity Background opacity
 * @returns {string} Computed color with opacity
 */
const getBackdropColor = (baseColor = '#FFFFFF', opacity = 0.8) => {
  // Clamp opacity to valid range
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  
  // Convert hex to rgba
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };
  
  // Parse base color
  const rgb = hexToRgb(baseColor);
  
  // Return rgba string
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedOpacity})`;
};

// Export a unified API for visual properties
export default {
  getCornerRadius,
  getShadowParams,
  getOpticalTypography,
  getBlurIntensity,
  getBackdropColor,
  
  // Common elevation levels for consistency
  elevation: {
    none: 0,
    low: 1,
    medium: 3,
    high: 8,
    overlay: 16
  }
};