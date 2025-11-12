import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/global';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/useAuth';

export default function LoginScreen() {

  type RootStackParamList = {
    Home: undefined;
    Register: undefined;
  };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const safeAreaInsets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      await signIn(email, password);
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
        <Text style={styles.label}>Email:</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.textInput}
          placeholder="tu@email.com"
          placeholderTextColor="#999"
        />
        <Text style={styles.label}>Password:</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.textInput}
          placeholder="Tu contraseña"
          placeholderTextColor="#999"
        />
        {error ? <Text style={{ color: "red", marginTop: 10 }}>{error}</Text> : null}
        <Pressable
          style={[globalStyles.button, { marginTop: 20 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>{loading ? "Iniciando..." : "Iniciar Sesión"}</Text>
        </Pressable>

        <Pressable
          style={{ marginTop: 15 }}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={{ color: "#6366f1", textAlign: "center" }}>
            ¿No tienes cuenta? Regístrate y consigue 20 OLS gratis
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
