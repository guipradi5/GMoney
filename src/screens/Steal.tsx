import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { globalStyles } from '../styles/global';

export default function StealScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const isDarkMode = useColorScheme() === 'dark';
    const [isListening, setIsListening] = useState(false);
    const listeningRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        async function startNfc() {
            try {
                await NfcManager.start();
                listeningRef.current = true;
                setIsListening(true);
                readLoop();
            } catch (e) {
                console.warn('Error iniciando NFC:', e);
            }
        }

        async function readLoop() {
            while (listeningRef.current && isMounted) {
                try {
                    // Activar la lectura NFC
                    await NfcManager.requestTechnology(NfcTech.Ndef);
                    const tag = await NfcManager.getTag();
                    if (tag) {
                        console.log('Tag detectado:', tag);
                    }
                } catch (err) {
                    // Silenciamos errores de timeout o cancelación
                } finally {
                    // Liberamos el recurso NFC
                    await NfcManager.cancelTechnologyRequest();
                    // Esperamos un poco antes de volver a intentar
                    //@ts-ignore
                    await new Promise(res => setTimeout(res, 800));
                }
            }
        }

        startNfc();

        // Limpieza al salir de la screen
        return () => {
            isMounted = false;
            listeningRef.current = false;
            setIsListening(false);
            NfcManager.cancelTechnologyRequest().catch(() => { });
        };
    }, []);

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
                <Text style={styles.description}>
                </Text>
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
