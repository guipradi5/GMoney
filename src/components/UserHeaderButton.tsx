import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/useAuth';

export const UserHeaderButton = () => {
    const [userName, setUserName] = useState<string>('');
    const [menuVisible, setMenuVisible] = useState(false);
    const { signOut } = useAuth();

    useEffect(() => {
        const loadUserName = async () => {
            const name = await AsyncStorage.getItem('name');
            if (name) {
                setUserName(name);
            }
        };
        loadUserName();
    }, []);

    const firstLetter = userName.charAt(0).toUpperCase() || 'U';

    const handleLogout = async () => {
        setMenuVisible(false);
        await signOut();
    };

    return (
        <>
            <Pressable
                onPress={() => setMenuVisible(true)}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{firstLetter}</Text>
                </View>
            </Pressable>

            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menu}>
                        <Pressable
                            style={styles.menuItem}
                            onPress={handleLogout}
                        >
                            <Text style={styles.menuItemText}>Cerrar sesión</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        paddingTop: 60,
        paddingRight: 10,
    },
    menu: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginRight: 10,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemText: {
        fontSize: 14,
        color: '#dc2626',
        fontWeight: '500',
    },
});
