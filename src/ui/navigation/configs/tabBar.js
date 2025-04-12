// src/ui/navigation/configs/tabBar.js
//
// Enhanced tab bar configuration with iOS 18 material integration
// Implements backdrop material effects and safe area composition

import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import platformDetection from '../../platform/detection';
import visualProperties from '../../platform/visualProperties';
import BackdropMaterial, { MATERIAL_TYPES } from '../../components/BackdropMaterial';
import navigationTheme from '../theme';

const { tokens, platform } = navigationTheme;

/**
 * Generate tab bar icon component with optimized rendering characteristics
 * 
 * @param {string} name - Base name of the Ionicons icon
 * @param {boolean} focused - Whether the tab is focused
 * @param {string} color - Color to apply to the icon
 * @param {number} size - Size of the icon
 * @returns {React.ReactElement} Memoized Ionicons component with optimal rendering properties
 */
const getTabBarIcon = (name) => ({ focused, color, size }) => {
  // Use outline version when not focused, solid when focused for iOS 18 style
  const iconName = focused ? name : `${name}-outline`;
  
  // iOS 18 enhances the visual weight contrast between selected/unselected
  const effectiveSize = focused ? size * 1.05 : size;
  
  return (
    <Ionicons 
      name={iconName} 
      size={effectiveSize} 
      color={color}
      // Enable GPU acceleration for icon animations on Android
      style={Platform.OS === 'android' ? { 
        renderToHardwareTextureAndroid: true 
      } : undefined}
    />
  );
};

/**
 * Map route names to appropriate icon names with semantic meaning
 */
const getIconName = (routeName) => {
  switch (routeName) {
    case 'HomeTab':
      return 'home';
    case 'Rounds':
      return 'golf';
    case 'Insights':
      return 'bulb';
    case 'Profile':
      return 'person';
    default:
      return 'apps';
  }
};

/**
 * Create complete tab bar configuration with material integration
 * 
 * @param {Object} route - Current route object
 * @returns {Object} Tab bar configuration object with iOS 18 visual refinements
 */
const getTabBarConfig = (route) => {
  const baseName = route.name;
  
  return {
    // Convert route name to display name if needed
    tabBarLabel: baseName === 'HomeTab' ? 'Clubhouse' : baseName,
    
    // Generate appropriate icon based on route
    tabBarIcon: getTabBarIcon(getIconName(baseName)),
    
    // Apply consistent styling from tokens
    activeTintColor: tokens.colors.tint.tabBarActive,
    inactiveTintColor: tokens.colors.tint.tabBarInactive,
    
    // Enhanced style with dynamic shadow parameters
    tabBarStyle: {
      ...getTabBarVisibility(route),
      // Shadow implementation with physical properties
      ...visualProperties.getShadowParams(platformDetection.isIOS ? 2 : 4),
    },
    
    // Add badge for "new" features if needed (Insights tab)
    ...(baseName === 'Insights' ? {
      tabBarBadge: 'New',
      // iOS 18 badge styling
      tabBarBadgeStyle: {
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 14,
        ...Platform.select({
          ios: {
            marginTop: 2,
          }
        })
      }
    } : {}),
  };
};

/**
 * Determines if the tab bar should be hidden for certain routes
 * 
 * @param {Object} route - Current route object
 * @returns {Object|undefined} Style object with display: 'none' or undefined
 */
const getTabBarVisibility = (route) => {
  const routeName = route.name;
  
  // Hide the tab bar on these screens
  const hiddenRoutes = [
    'CourseSelector', 
    'Tracker', 
    'ScorecardScreen'
  ];
  
  // Check nested navigation structure
  if (route?.state?.routes) {
    const currentRoute = route.state.routes[route.state.index];
    if (hiddenRoutes.includes(currentRoute.name)) {
      return { display: 'none' };
    }
  }
  
  if (hiddenRoutes.includes(routeName)) {
    return { display: 'none' };
  }
  
  return undefined;
};

/**
 * Create custom tab bar that integrates with our material system
 * This implements iOS 18-style translucent tab bar
 * 
 * @param {Object} props - Props from React Navigation
 * @returns {React.ReactElement} Custom tab bar with material effects
 */
const createCustomTabBar = (props) => {
  // Use backdrop material for iOS 18 effect on capable devices
  if (platformDetection.isIOS && platformDetection.supportsBlurEffects) {
    return (
      <BackdropMaterial
        type={MATERIAL_TYPES.THIN}
        style={[
          styles.tabBar,
          {
            height: tokens.spacing.tabBar.height + platformDetection.getBottomInset(),
            paddingBottom: platformDetection.getBottomInset()
          }
        ]}
      >
        <View style={styles.tabBarContent}>
          {props.children}
        </View>
      </BackdropMaterial>
    );
  }
  
  // Standard implementation for Android or devices without blur support
  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: tokens.colors.background.tabBar,
          height: tokens.spacing.tabBar.height + platformDetection.getBottomInset(),
          paddingBottom: platformDetection.getBottomInset(),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: tokens.colors.border.tabBar,
        }
      ]}
    >
      <View style={styles.tabBarContent}>
        {props.children}
      </View>
    </View>
  );
};

/**
 * Create the full tab navigator screen options with material integration
 * 
 * @returns {Object} Screen options for tab navigator
 */
const getTabNavigatorScreenOptions = () => {
  return {
    // Hide the tab-level header since each stack has its own headers
    headerShown: false,
    
    // Apply iOS 18 animation characteristics
    tabBarHideOnKeyboard: true,
    
    // Implement custom tab bar with material effects
    tabBarBackground: () => (
      platformDetection.isIOS && platformDetection.supportsBlurEffects ?
        <BackdropMaterial
          type={MATERIAL_TYPES.THIN}
          style={StyleSheet.absoluteFill}
        /> : null
    ),
    
    // Standard tab bar styles
    tabBarStyle: {
      backgroundColor: platformDetection.isIOS && platformDetection.supportsBlurEffects ? 
        'transparent' : tokens.colors.background.tabBar,
      height: tokens.spacing.tabBar.height + platformDetection.getBottomInset(),
      paddingBottom: platformDetection.getBottomInset(),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: platformDetection.isIOS && platformDetection.supportsBlurEffects ? 
        'rgba(200, 200, 200, 0.25)' : tokens.colors.border.tabBar,
      ...visualProperties.getShadowParams(platformDetection.isIOS ? 1 : 3),
    },
    
    // iOS 18 animation transition specs
    tabBarItemStyle: {
      paddingTop: 6,
    },
    
    // Typography refinements for labels
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '500',
      marginBottom: Platform.OS === 'ios' ? 0 : 4,
      ...visualProperties.getOpticalTypography(10, '500')
    },
  };
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
  }
});

export {
  getTabBarConfig,
  getTabNavigatorScreenOptions,
  createCustomTabBar
};