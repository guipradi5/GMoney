import { useColorScheme, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AntDesign } from '@react-native-vector-icons/ant-design'
import { globalStyles } from '../styles/global';
import { useAuth } from '../context/useAuth';
import { sendTokens } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export default function SendScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const isDarkMode = useColorScheme() === 'dark';
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [email, setEmail] = useState('');
    const [quantity, setQuantity] = useState('');
    const [balance, setBalance] = useState<string>('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadBalance = async () => {
            const storedBalance = await AsyncStorage.getItem('balance');
            if (storedBalance) {
                setBalance(storedBalance);
            }
        };
        loadBalance();
    }, []);

    const numericBalance = parseFloat(balance) || 0;
    const numericQuantity = parseFloat(quantity) || 0;
    const remainingBalance = numericBalance - numericQuantity;
    const isNegative = remainingBalance < 0;

    const handleSend = async () => {
        setError('');
        setSuccess('');

        if (!email.trim()) {
            setError('El email es requerido');
            return;
        }
        if (email === await AsyncStorage.getItem('email')) {
            setError('No puedes enviarte tokens a ti mismo');
            return;
        }
        if (!quantity || numericQuantity <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }
        if (remainingBalance < 0) {
            setError('No tienes suficientes tokens');
            return;
        }

        setLoading(true);
        try {
            const result = await sendTokens(email, numericQuantity);
            setSuccess('Tokens enviados correctamente');
            setEmail('');
            setQuantity('');
            // Actualizar balance localmente
            const newBalance = remainingBalance.toString();
            setBalance(newBalance);
            await AsyncStorage.setItem('balance', newBalance);
            Alert.alert('Éxito', 'Tokens enviados correctamente', [
                {
                    text: 'Aceptar',
                    onPress: () => navigation.navigate('Home'),
                },
            ]);
        } catch (err: any) {
            setError(err.message || 'Error al enviar tokens');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[globalStyles.container, { paddingTop: safeAreaInsets.top }]} showsVerticalScrollIndicator={false}>
            <View style={[globalStyles.content, { flexDirection: 'column', alignItems: 'center' }]}>
                <Text style={[globalStyles.greeting, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Enviar tokens
                </Text>

                {/* Balance actual */}
                <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>
                        Balance actual
                    </Text>
                    <View style={styles.balanceDisplay}>
                        <Text style={[styles.balanceAmount, { color: isDarkMode ? '#fff' : '#000' }]}>
                            {Math.floor(numericBalance)}
                        </Text>
                        <Text style={[styles.balanceDecimals, { color: isDarkMode ? '#aaa' : '#666' }]}>
                            .{(numericBalance % 1).toFixed(2).substring(2)}
                        </Text>
                    </View>
                </View>

                {/* Email input */}
                <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Email del destinatario
                </Text>
                <TextInput
                    style={[styles.input, { color: isDarkMode ? '#000' : '#000', backgroundColor: '#fff' }]}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    keyboardType="email-address"
                />

                {/* Quantity input */}
                <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Cantidad a enviar
                </Text>
                <TextInput
                    style={[styles.input, { color: isDarkMode ? '#000' : '#000', backgroundColor: '#fff' }]}
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={quantity}
                    onChangeText={setQuantity}
                    editable={!loading}
                    keyboardType="decimal-pad"
                />

                {/* Remaining balance */}
                <View style={[styles.balanceContainer, { marginTop: 12, marginBottom: 24 }]}>
                    <Text style={[styles.balanceLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>
                        Balance restante
                    </Text>
                    <View style={styles.balanceDisplay}>
                        <Text style={[styles.balanceAmount, { color: isNegative ? '#ef4444' : (isDarkMode ? '#fff' : '#000') }]}>
                            {Math.floor(remainingBalance)}
                        </Text>
                        <Text style={[styles.balanceDecimals, { color: isNegative ? '#ef4444' : (isDarkMode ? '#aaa' : '#666') }]}>
                            .{Math.abs(remainingBalance % 1).toFixed(2).substring(2)}
                        </Text>
                    </View>
                </View>

                {/* Error message */}
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {/* Success message */}
                {success ? (
                    <Text style={styles.successText}>{success}</Text>
                ) : null}

                {/* Send button */}
                <TouchableOpacity
                    style={[styles.sendButton, { opacity: loading ? 0.6 : 1 }]}
                    onPress={handleSend}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.sendButtonText}>Enviar tokens</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
        alignSelf: 'flex-start',
        marginLeft: 20,
    },
    input: {
        width: '90%',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 12,
    },
    balanceContainer: {
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 12,
        marginBottom: 8,
    },
    balanceDisplay: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: '700',
    },
    balanceDecimals: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginTop: 12,
        marginBottom: 12,
        textAlign: 'center',
    },
    successText: {
        color: '#10b981',
        fontSize: 14,
        marginTop: 12,
        marginBottom: 12,
        textAlign: 'center',
    },
    sendButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 32,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 150,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});