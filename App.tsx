import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import CardScannerScreen from './src/screens/CardScannerScreen';

import type { RootStackParamList } from './src/navigation/types';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="CardScanner"
          component={CardScannerScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;