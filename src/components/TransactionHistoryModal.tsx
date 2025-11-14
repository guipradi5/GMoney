import { useColorScheme, View, Text, StyleSheet, Modal, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AntDesign } from '@react-native-vector-icons/ant-design';
import { useEffect, useState } from 'react';
import { getTransactionHistory } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
    id: string;
    emiter: string;
    receiver: string;
    emiter_name: string;
    receiver_name: string;
    amount: string;
    date: string;
    type: string;
    state: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
}

export function TransactionHistoryModal({ visible, onClose }: Props) {
    const isDarkMode = useColorScheme() === 'dark';
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [user, setUser] = useState<string | null>(null);


    const fetchTransactions = async (pageNum: number) => {
        if (loading) return; // Evitar llamadas duplicadas
        if (!hasMore && pageNum > 1) return;

        console.log(`Cargando página ${pageNum}...`);
        setLoading(true);
        try {
            const newTransactions = await getTransactionHistory(pageNum);
            console.log(`Recibidas ${newTransactions.length} transacciones para página ${pageNum}`);

            if (pageNum === 1) {
                const user = await AsyncStorage.getItem('id')
                setUser(user)
                setTransactions(newTransactions);
            } else {
                setTransactions(prev => [...prev, ...newTransactions]);
            }

            // Si hay menos de 25 resultados, no hay más páginas
            setHasMore(newTransactions.length === 25);
            console.log(`hasMore: ${newTransactions.length === 25}`);
        } catch (err: any) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setPage(1);
            setTransactions([]);
            setHasMore(true);
            fetchTransactions(1);
        }
    }, [visible]);

    const handleEndReached = () => {
        console.log('handleEndReached llamado - loading:', loading, 'hasMore:', hasMore, 'page:', page);
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchTransactions(nextPage);
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        // Convertir fecha GMT a hora local
        const date = new Date(item.date + 'Z'); // Añadir 'Z' para indicar que es UTC

        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
        const formattedTime = date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });

        let POS = item.emiter_name
        let sign = "+"
        let color = { color: '#00a558ff' }

        if (item.emiter === user) {
            POS = item.receiver_name
            sign = '-'
            color = { color: '#a50000ff' }
        }

        // Traducir type
        const typeTranslations: { [key: string]: string } = {
            'send': 'Envío',
            'steal': 'Robo',
            'petition': 'Petición'
        };
        const typeLabel = typeTranslations[item.type] || item.type;

        // Traducir state
        const stateTranslations: { [key: string]: string } = {
            'completed': 'Completada',
            'pending': 'Pendiente',
            'failed': 'Fallida',
            'cancelled': 'Cancelada'
        };
        const stateLabel = stateTranslations[item.state] || item.state;

        return (
            <View style={[styles.transactionItem, { backgroundColor: isDarkMode ? '#1e1b4b' : '#f3f4f6' }]}>
                <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionEmail, { color: isDarkMode ? '#fff' : '#000' }]}>
                        {POS}
                    </Text>
                    <View style={styles.metadataRow}>
                        <Text style={[styles.transactionType, { color: isDarkMode ? '#aaa' : '#666' }]}>
                            {typeLabel}
                        </Text>
                        <Text style={[styles.transactionState, { color: isDarkMode ? '#aaa' : '#666' }]}>
                            • {stateLabel}
                        </Text>
                    </View>
                    <Text style={[styles.transactionDate, { color: isDarkMode ? '#888' : '#999' }]}>
                        {formattedDate} {formattedTime}
                    </Text>
                </View>
                <Text style={[styles.transactionAmount, color]}>
                    {sign}{parseFloat(item.amount).toFixed(2)} OLS
                </Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#6366f1" />
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Historial de transacciones
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <AntDesign name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                </View>

                {transactions.length === 0 && !loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : '#666' }]}>
                            No hay transacciones
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={renderTransaction}
                        keyExtractor={(item) => item.id}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={renderFooter}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 8,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 8,
        borderRadius: 8,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionEmail: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    transactionType: {
        fontSize: 12,
        fontWeight: '500',
    },
    transactionState: {
        fontSize: 12,
        marginLeft: 3,
    },
    transactionDate: {
        fontSize: 11,
    },
    transactionAmount: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 12,
    },
    footerLoader: {
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
