import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { globalStyles } from '../styles/global';
import { useHceReader } from '../hooks/useHceReader';

export default function StealScreen() {
    const isDarkMode = useColorScheme() === 'dark';
    const { isListening, lastPayload, startReading, stopReading } = useHceReader("F0001508050508");

    useEffect(() => {
        startReading();
        return () => stopReading();
    }, [startReading, stopReading]);

    // Parsear el JSON del payload si existe
    let userId = null;
    if (lastPayload) {
        try {
            const data = JSON.parse(lastPayload);
            userId = data.accountId;
        } catch (e) {
            console.warn("Error al parsear payload:", e);
        }
    }

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
                {userId && (
                    <Text style={[styles.description, { color: 'limegreen', fontWeight: 'bold', fontSize: 18, marginTop: 20 }]}>
                        ¡Usuario detectado: {userId}!
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
