/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StealScreen from './src/screens/Steal';
import HomeScreen from './src/screens/Home';
import LoginScreen from './src/screens/Login';
import { View } from 'react-native';

import * as React from 'react';


const mainColor = '#6366f1';

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerStyle: {
      backgroundColor: mainColor,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
  screens: {
    Login: {
      screen: LoginScreen,
      options: { title: 'G-Money' },
    },
    Home: {
      screen: HomeScreen,
      options: { title: 'Bienvenido',
        headerLeft: () => <View />,
       },
    },
    Steal: {
      screen: StealScreen,
      options: { title: 'Robar' },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export function App() {
  return <Navigation />;
}

export default App;
