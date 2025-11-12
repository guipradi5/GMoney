import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/global';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/useAuth';

export default function RegisterScreen() {

    type RootStackParamList = {
        Home: undefined;
        Login: undefined;
    };
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const safeAreaInsets = useSafeAreaInsets();
    const { signUp } = useAuth();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError("");

        // Validaciones básicas
        if (!email || !name || !password || !confirmPassword) {
            setError("Todos los campos son obligatorios");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        try {
            setLoading(true);
            await signUp(email, name, password);
            // La navegación se maneja automáticamente en App.tsx
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[globalStyles.container, { paddingTop: safeAreaInsets.top }]}>
            <View style={[globalStyles.content, globalStyles.center]}>
                <Text style={styles.title}>Crear cuenta</Text>

                <Text style={styles.label}>Email:</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="tu@email.com"
                    placeholderTextColor="#999"
                    style={styles.textInput}
                />

                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Tu nombre"
                    placeholderTextColor="#999"
                    style={styles.textInput}
                />

                <Text style={styles.label}>Contraseña:</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Contraseña"
                    placeholderTextColor="#999"
                    style={styles.textInput}
                />

                <Text style={styles.label}>Confirmar contraseña:</Text>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Confirmar contraseña"
                    placeholderTextColor="#999"
                    style={styles.textInput}
                />

                {error ? <Text style={{ color: "red", marginTop: 10 }}>{error}</Text> : null}

                <Pressable
                    style={[globalStyles.button, { marginTop: 20 }]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={globalStyles.buttonText}>{loading ? "Registrando..." : "Registrarse"}</Text>
                </Pressable>

                <Pressable
                    style={{ marginTop: 15 }}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={{ color: "#6366f1", textAlign: "center" }}>¿Ya tienes cuenta? Inicia sesión</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: '#fff',
    },
    textInput: {
        height: 40,
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        width: '100%',
        backgroundColor: '#fff',
        color: '#000',
    },
    label: {
        color: '#fff',
        marginTop: 10,
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
});
