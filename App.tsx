/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StealScreen from './src/screens/Steal';
import HomeScreen from './src/screens/Home';
import LoginScreen from './src/screens/Login';
import RegisterScreen from './src/screens/Register';
import { View, ActivityIndicator } from 'react-native';

import * as React from 'react';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { UserHeaderButton } from './src/components/UserHeaderButton';
import SendScreen from './src/screens/Send';

const mainColor = '#6366f1';

const Stack = createNativeStackNavigator();

// Stack de autenticación (Login y Register)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: mainColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'G-Money', headerShown: true }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Regístrate' }}
      />
    </Stack.Navigator>
  );
}

// Stack de aplicación (Home, Steal, etc.)
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: mainColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <UserHeaderButton />,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Bienvenido',
          headerLeft: () => <View />,
        }}
      />
      <Stack.Screen
        name="Steal"
        component={StealScreen}
        options={{ title: 'Robar' }}
      />
      <Stack.Screen
        name="Send"
        component={SendScreen}
        options={{ title: 'Enviar' }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const authContext = React.useContext(AuthContext);

  if (!authContext) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={mainColor} />
      </View>
    );
  }

  const { state } = authContext;

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={mainColor} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.userToken == null ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
}

export function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

export default App;
