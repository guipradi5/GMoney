import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome } from '@react-native-vector-icons/fontawesome'
import { AntDesign } from '@react-native-vector-icons/ant-design'
import { useNavigation } from '@react-navigation/native';

import { globalStyles, backgroundColor } from '../styles/global';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function HomeScreen() {
    const isDarkMode = useColorScheme() === 'dark';
    const safeAreaInsets = useSafeAreaInsets();

    const totalAmount = 124.50; // Example amount
    const name = 'Guishermo';

    type RootStackParamList = {
        Home: undefined;
        Steal: undefined; // o { /* params */ } si la pantalla recibe parámetros
        // ...otras rutas...
    };
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


    return (
        <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={[globalStyles.container, { paddingTop: safeAreaInsets.top }]}>
                {/* <NewAppScreen
                    templateFileName="App.tsx"
                    safeAreaInsets={safeAreaInsets}
                /> */}

                <View style={globalStyles.content}>
                    <Text style={[globalStyles.greeting, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Bienvenido de vuelta, {name}
                    </Text>

                    <View style={styles.moneyCardWrapper}>
                        <View style={styles.moneyCardUnderlay} />
                        <LinearGradient
                            colors={['#6366f1', '#6366f130']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.95, y: 0 }}
                            style={styles.moneyCard}
                        >
                            <Text style={styles.moneyLabel}>Balance toal</Text>
                            <Text style={styles.moneyAmount}>
                                {totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} OLS
                            </Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={() =>
                            navigation.navigate('Steal')
                        }>
                            <View style={styles.actionIconWrapper}>
                                <FontAwesome name="rocket" color="rgb(255, 255, 255)" size={25} />
                            </View>
                            <Text style={styles.actionLabel}>Robar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
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
            </View>
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
});