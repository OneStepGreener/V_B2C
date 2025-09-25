/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import DriverLoginScreen from './src/screens/DriverLoginScreen';
import PickupStartScreen from './src/screens/PickupStartScreen';
import UpdatingStatsScreen from './src/screens/UpdatingStatsScreen';
import FinalPickupScreen from './src/screens/FinalPickupScreen';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1a1a1a' }
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
        <Stack.Screen name="PickupStart" component={PickupStartScreen} />
        <Stack.Screen name="UpdatingStats" component={UpdatingStatsScreen} />
        <Stack.Screen name="FinalPickup" component={FinalPickupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
