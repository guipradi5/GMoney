import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { globalStyles } from '../styles/global';
import { useHceReader } from '../hooks/useHceReader';
import { stealToken } from '../api/api';

export default function StealScreen() {
    const isDarkMode = useColorScheme() === 'dark';
    const { isListening, lastPayload, setLastPayload, startReading, stopReading } = useHceReader("F0001508050508");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const lastProcessedTime = useRef<number>(0);

    useEffect(() => {
        startReading();
        return () => stopReading();
    }, [startReading, stopReading]);

    // Procesar lectura NFC
    useEffect(() => {
        if (!lastPayload || isProcessing) return;

        const now = Date.now();
        if (now - lastProcessedTime.current < 1500) {
            setLastPayload(null);
            return;
        }

        try {
            const data = JSON.parse(lastPayload);
            const userId = data.accountId;

            if (userId) {
                handleSteal(userId);
            }
        } catch (e) {
            console.warn("Error al parsear payload:", e);
        }

        setLastPayload(null);
    }, [lastPayload, isProcessing]);

    const handleSteal = async (id: string) => {
        try {
            setIsProcessing(true);
            setErrorMessage(null);
            lastProcessedTime.current = Date.now();

            const res = await stealToken(id);

            Alert.alert(
                res.title || "¡Éxito!",
                res.message,
                [{ text: "OK" }]
            );
        } catch (error: any) {
            console.error("Error al robar token:", error);
            setErrorMessage(error.message || "Error desconocido");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={[globalStyles.container, { paddingTop: '40%' }]}>
            <View style={[globalStyles.content, { flexDirection: 'column', alignItems: 'center' }]}>
                <Text style={[globalStyles.greeting, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Robar tokens
                </Text>
                <AntDesign name="wifi" color={isListening ? "limegreen" : "red"} size={50} />
                <AntDesign name="mobile" color={isListening ? "limegreen" : "red"} size={40} />
                <Text style={styles.description}>
                    {isListening ? 'NFC activo' : 'NFC desactivado'}
                    {'\n'}
                    {isListening ? 'Acerca otro móvil para robar 1 token' : ''}
                </Text>
                {isProcessing && (
                    <Text style={[styles.description, { color: 'limegreen', fontWeight: 'bold', fontSize: 18, marginTop: 20 }]}>
                        Procesando...
                    </Text>
                )}
                {errorMessage && (
                    <Text style={[styles.description, { color: 'red', fontWeight: 'bold', fontSize: 16, marginTop: 20 }]}>
                        {errorMessage}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    description: {
        marginTop: 30,
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
    },
});
