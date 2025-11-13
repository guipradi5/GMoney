import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6'
import { AntDesign } from '@react-native-vector-icons/ant-design'
import { useNavigation } from '@react-navigation/native';

import { globalStyles, backgroundColor } from '../styles/global';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../api/api';


export default function HomeScreen() {
    const isDarkMode = useColorScheme() === 'dark';
    const safeAreaInsets = useSafeAreaInsets();

    const [userName, setUserName] = useState<string | null>('');
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Extraer fetch para usar en mount y en pull-to-refresh
    const fetchUserData = async () => {
        try {
            setLoading(true);

            // Obtener nombre del storage
            const storedName = await AsyncStorage.getItem('name');
            if (storedName) {
                setUserName(storedName);
            }

            // Obtener perfil y balance
            const profile = await getProfile();
            // el endpoint puede devolver balance en profile.user.balance o profile.balance
            const userBalance = profile?.user?.balance ?? profile?.balance ?? (await AsyncStorage.getItem('balance')) ?? '0';

            await AsyncStorage.setItem('balance', userBalance.toString());
            setBalance(parseFloat(userBalance));
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Intentar cargar el balance del storage si la llamada falla
            const storedBalance = (await AsyncStorage.getItem('balance')) ?? '0';
            if (storedBalance) {
                setBalance(parseFloat(storedBalance));
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    type RootStackParamList = {
        Home: undefined;
        Steal: undefined;
        Send: undefined;
    };
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


    return (
        <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView
                contentContainerStyle={[globalStyles.container, { paddingTop: safeAreaInsets.top }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchUserData();
                        }}
                        tintColor="#ffffff"
                        colors={["#6366f1"]}
                    />
                }
            >
                {/* <NewAppScreen
                    templateFileName="App.tsx"
                    safeAreaInsets={safeAreaInsets}
                /> */}

                <View style={globalStyles.content}>
                    <Text style={[globalStyles.greeting, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Bienvenido, {userName}
                    </Text>

                    <View style={styles.moneyCardWrapper}>
                        <View style={styles.moneyCardUnderlay} />
                        <LinearGradient
                            colors={['#6366f1', '#6366f130']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.95, y: 0 }}
                            style={styles.moneyCard}
                        >
                            <Text style={styles.moneyLabel}>Balance total</Text>
                            <Text style={styles.moneyAmount}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    (() => {
                                        const fixed = (isNaN(balance) ? 0 : balance).toFixed(2);
                                        const [intPart, decPart] = fixed.split('.');
                                        const intFormatted = parseInt(intPart, 10).toLocaleString('es-ES');
                                        return (
                                            <>
                                                <Text style={styles.moneyInteger}>{intFormatted}</Text>
                                                <Text style={styles.moneyDecimals}>,{decPart}</Text>
                                                <Text style={styles.moneyCurrency}> OLS</Text>
                                            </>
                                        );
                                    })()
                                )}
                            </Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() =>
                            navigation.navigate('Steal')
                        }>
                            <View style={styles.actionIconWrapper}>
                                <FontAwesome6 name="hand-holding-dollar" iconStyle='solid' color="rgb(255, 255, 255)" size={25} />
                            </View>
                            <Text style={styles.actionLabel}>Robar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() =>
                            navigation.navigate('Send')
                        }>
                            <View style={styles.actionIconWrapper}>
                                <AntDesign name="rocket" color="rgb(255, 255, 255)" size={25} />
                            </View>
                            <Text style={styles.actionLabel}>Enviar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                            <View style={styles.actionIconWrapper}>
                                <AntDesign name="money-collect" color="rgb(255, 255, 255)" size={25} />
                            </View>
                            <Text style={styles.actionLabel}>Recibir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaProvider>
    );
}




const styles = StyleSheet.create({
    actionsRow: {
        marginTop: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
    },
    actionIconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#312e81',
    },
    actionLabel: {
        marginTop: 8,
        color: '#e0e7ff',
        fontSize: 12,
        fontWeight: '600',
    },
    moneyCardWrapper: {
        position: 'relative',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    moneyCardUnderlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: backgroundColor,
    },
    moneyCard: {
        borderRadius: 16,
        padding: 24,
    },
    moneyLabel: {
        display: 'flex',
        fontSize: 12,
        color: '#e0e7ff',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    moneyAmount: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    moneyInteger: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    moneyDecimals: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 4,
    },
    moneyCurrency: {
        fontSize: 30,
        fontWeight: '600',
        color: '#e0e7ff',
        marginLeft: 6,
    },
});