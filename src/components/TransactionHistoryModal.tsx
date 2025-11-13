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
    amount: string;
    date: string;
    state?: string;
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
        if (!hasMore && pageNum > 1) return;

        setLoading(true);
        try {
            const newTransactions = await getTransactionHistory(pageNum);

            if (pageNum === 1) {
                const user = await AsyncStorage.getItem('email')
                setUser(user)
                setTransactions(newTransactions);
            } else {
                setTransactions(prev => [...prev, ...newTransactions]);
            }

            // Si hay menos de 100 resultados, no hay más páginas
            setHasMore(newTransactions.length === 100);
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
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchTransactions(nextPage);
        }
    };

    const renderTransaction = async ({ item }: { item: Transaction }) => {
        const date = new Date(item.date);

        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
        const formattedTime = date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });

        let POS = item.emiter
        let sign = "+"
        let color = { color: '#00a558ff' }

        console.log(item.receiver)

        if (item.emiter === user) {
            POS = item.receiver
            sign = '-'
            color = { color: '#a50000ff' }
        }

        return (
            <View style={[styles.transactionItem, { backgroundColor: isDarkMode ? '#1e1b4b' : '#f3f4f6' }]}>
                <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionEmail, { color: isDarkMode ? '#fff' : '#000' }]}>
                        {POS}
                    </Text>
                    <Text style={[styles.transactionDate, { color: isDarkMode ? '#aaa' : '#666' }]}>
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
                        onEndReachedThreshold={0.5}
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
    transactionDate: {
        fontSize: 12,
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
