import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://guillermopradas.com/api/gmoney"; // usa 10.0.2.2 en Android Emulator

async function getToken() {
    return await AsyncStorage.getItem("accessToken");
}

async function getRefreshToken() {
    return await AsyncStorage.getItem("refreshToken");
}

export async function login(email, password) {
    console.log("Iniciando login para:", { email, password });
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text (raw):", text);

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("No se puede parsear JSON:", e);
        data = { message: "Respuesta inválida del servidor" };
    }

    console.log("Parsed data:", data);
    if (res.status !== 200) throw new Error(data.message || data.error || "Error al registrarse");

    const response = data.response || data; // Ajuste aquí para manejar ambos casos

    await AsyncStorage.setItem("accessToken", response.access_token);
    await AsyncStorage.setItem("refreshToken", response.refresh_token);
    await AsyncStorage.setItem("email", response.user.email);
    await AsyncStorage.setItem("name", response.user.name);

    return data;
}

export async function register(email, name, password) {
    console.log("Iniciando registro para:", { email, name, password });
    try {
        const res = await fetch(`${API_URL}auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, password }),
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response text (raw):", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("No se puede parsear JSON:", e);
            data = { message: "Respuesta inválida del servidor" };
        }

        console.log("Parsed data:", data);
        if (res.status !== 200) throw new Error(data.message || data.error || "Error al registrarse");

        // Si el registro fue exitoso, inicia sesión automáticamente
        const loggedInData = await login(email, password);
        return loggedInData;
    } catch (error) {
        console.error("Error durante el registro:", error);
        throw error;
    }
}



export async function getProfile() {
    const res = await fetchWithAuth("me.php");

    const text = res._cachedText;

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("No se puede parsear JSON:", e);
        throw new Error("Respuesta inválida del servidor");
    }

    if (!res.ok) throw new Error(data.message || data.error || "Error al obtener perfil");

    const response = data.response || data; // Ajuste aquí para manejar ambos casos

    await AsyncStorage.setItem("email", response.user);
    await AsyncStorage.setItem("name", response.name);
    await AsyncStorage.setItem("balance", response.balance);

    return data;
}

export async function fetchWithAuth(endpoint, options = {}) {
    let token = await getToken();

    let res = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    });

    // Log status y raw output
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text (raw):", text);

    // Si expiró el token → intenta refrescar
    if (res.status === 401) {
        const refreshToken = await getRefreshToken();
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        console.log("Refresh Status:", refreshRes.status);

        if (refreshRes.ok) {
            console.log("Token refrescado con éxito");
            const refreshData = await refreshRes.json();
            await AsyncStorage.setItem("accessToken", refreshData.access_token);

            // reintentar la petición con el nuevo token
            token = refreshData.access_token;
            res = await fetch(`${API_URL}/${endpoint}`, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${token}`,
                },
            });

            // Log de la respuesta después de refresh
            console.log("Status (after refresh):", res.status);
            const textAfterRefresh = await res.text();
            console.log("Response text (raw, after refresh):", textAfterRefresh);

            // Retornar un objeto con el text para que no se consuma dos veces
            return { ...res, _cachedText: textAfterRefresh };
        } else {
            throw new Error("Sesión expirada, vuelve a iniciar sesión");
        }
    }

    // Retornar un objeto con el text para que no se consuma dos veces
    return { ...res, _cachedText: text };
}