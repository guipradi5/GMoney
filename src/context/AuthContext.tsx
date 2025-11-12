import React, { createContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '../api/api';

type AuthState = {
    isLoading: boolean;
    isSignOut: boolean;
    userToken: string | null;
};

type AuthAction =
    | { type: 'RESTORE_TOKEN'; payload: string | null }
    | { type: 'SIGN_IN' }
    | { type: 'SIGN_OUT' };

type AuthContextType = {
    state: AuthState;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, name: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
    isLoading: true,
    isSignOut: false,
    userToken: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'RESTORE_TOKEN':
            return {
                ...state,
                isLoading: false,
                userToken: action.payload,
            };
        case 'SIGN_IN':
            return {
                ...state,
                isSignOut: false,
                userToken: 'token-set',
            };
        case 'SIGN_OUT':
            return {
                ...state,
                isSignOut: true,
                userToken: null,
            };
        default:
            return state;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                // Restaurar el token si existe
                const token = await AsyncStorage.getItem('accessToken');
                if (token) {
                    dispatch({ type: 'RESTORE_TOKEN', payload: token });
                } else {
                    dispatch({ type: 'RESTORE_TOKEN', payload: null });
                }
            } catch (e) {
                console.error('Error al restaurar el token:', e);
                dispatch({ type: 'RESTORE_TOKEN', payload: null });
            }
        };

        bootstrapAsync();
    }, []);

    const authContext = {
        state,
        signIn: async (email: string, password: string) => {
            try {
                await apiLogin(email, password);
                dispatch({ type: 'SIGN_IN' });
            } catch (error) {
                throw error;
            }
        },
        signUp: async (email: string, name: string, password: string) => {
            try {
                await apiRegister(email, name, password);
                dispatch({ type: 'SIGN_IN' });
            } catch (error) {
                throw error;
            }
        },
        signOut: async () => {
            try {
                // Limpiar AsyncStorage
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                await AsyncStorage.removeItem('email');
                await AsyncStorage.removeItem('name');
                await AsyncStorage.removeItem('balance');

                dispatch({ type: 'SIGN_OUT' });
            } catch (e) {
                console.error('Error al cerrar sesión:', e);
            }
        },
    };

    return (
        <AuthContext.Provider value={authContext}>
            {children}
        </AuthContext.Provider>
    );
};
