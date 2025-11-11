/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StealScreen from './src/screens/Steal';
import HomeScreen from './src/screens/Home';


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
    Home: {
      screen: HomeScreen,
      options: { title: 'Bienvenido' },
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
