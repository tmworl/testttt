// src/navigation/MainNavigator.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStack";
import RoundsScreen from "../screens/RoundScreen";
import InsightsScreen from "../screens/InsightsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ScorecardScreen from "../screens/ScorecardScreen";

// Import our navigation styling system with enhanced architectural components
import navigationTheme from "../ui/navigation/theme";
import { 
  getTabBarConfig, 
  getTabNavigatorScreenOptions,
  createCustomTabBar 
} from "../ui/navigation/configs/tabBar";
import { 
  createStackNavigatorScreenOptions,
  createRoundsStackConfig, 
  createInsightsStackConfig, 
  createProfileStackConfig 
} from "../ui/navigation/configs/stack";
import platformDetection from "../ui/platform/detection";

// Create stack navigators for each tab that needs nested navigation
const RoundsStack = createStackNavigator();
const InsightsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

/**
 * RoundsStackScreen Component
 * 
 * Creates a stack navigator for the Rounds tab with consistent headers
 * This allows navigation from the rounds list to the scorecard view
 */
function RoundsStackScreen() {
  // Get configuration for the rounds stack
  const config = createRoundsStackConfig();
  
  return (
    <RoundsStack.Navigator screenOptions={config.screenOptions}>
      <RoundsStack.Screen 
        name="RoundsScreen" 
        component={RoundsScreen} 
        options={config.screenConfigs.RoundsScreen.options}
      />
      <RoundsStack.Screen 
        name="ScorecardScreen" 
        component={ScorecardScreen} 
        options={config.screenConfigs.ScorecardScreen.options}
      />
    </RoundsStack.Navigator>
  );
}

/**
 * InsightsStackScreen Component
 * 
 * Creates a stack navigator for the Insights tab with consistent headers
 */
function InsightsStackScreen() {
  // Get configuration for the insights stack
  const config = createInsightsStackConfig();
  
  return (
    <InsightsStack.Navigator screenOptions={config.screenOptions}>
      <InsightsStack.Screen 
        name="InsightsScreen" 
        component={InsightsScreen}
        options={config.screenConfigs.InsightsScreen.options}
      />
    </InsightsStack.Navigator>
  );
}

/**
 * ProfileStackScreen Component
 * 
 * Creates a stack navigator for the Profile tab with consistent headers
 */
function ProfileStackScreen() {
  // Get configuration for the profile stack
  const config = createProfileStackConfig();
  
  return (
    <ProfileStack.Navigator screenOptions={config.screenOptions}>
      <ProfileStack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={config.screenConfigs.ProfileScreen.options}
      />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

/**
 * MainNavigator Component
 * 
 * Creates the bottom tab navigation for the app with four tabs:
 * - Home: For starting new rounds and seeing recent activity
 * - Rounds: For viewing completed rounds and scorecards
 * - Insights: For viewing AI-powered game analysis and improvement tips
 * - Profile: For user account settings
 */
export default function MainNavigator() {
  // Get the base screen options for our tab navigator
  const screenOptions = getTabNavigatorScreenOptions();
  
  // ARCHITECTURAL FIX: Correctly implement the custom tab bar renderer
  // The key architectural correction is providing a render function that properly 
  // evaluates M3 support at runtime and delegates rendering appropriately
  
  return (
    <Tab.Navigator 
      screenOptions={screenOptions}
      // Provide a proper render function that receives props from React Navigation
      tabBar={props => {
        // Evaluate M3 support at runtime (ensure supportsM3 is called as a function)
        const isM3Supported = platformDetection.supportsM3 && platformDetection.isAndroid;
        
        // Debugging to detect execution flow issues
        console.log('Tab Bar Renderer: Platform detection state', { 
          isAndroid: platformDetection.isAndroid, 
          supportsM3: platformDetection.supportsM3,
          isM3Supported 
        });
        
        // Return the appropriate component based on platform capability
        if (isM3Supported) {
          // Apply the custom M3 tab bar by executing the factory with props
          return createCustomTabBar(props);
        }
        
        // Fall back to default tab bar (React Navigation will use its built-in renderer)
        return undefined;
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={({ route }) => getTabBarConfig(route)}
      />
      <Tab.Screen
        name="Rounds"
        component={RoundsStackScreen}
        options={({ route }) => getTabBarConfig(route)}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsStackScreen}
        options={({ route }) => getTabBarConfig(route)}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={({ route }) => getTabBarConfig(route)}
      />
    </Tab.Navigator>
  );
}