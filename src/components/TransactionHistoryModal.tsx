import { useColorScheme, View, Text, StyleSheet, Modal, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AntDesign } from '@react-native-vector-icons/ant-design';
import { useEffect, useState } from 'react';
import { getTransactionHistory } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

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

    const getTransactionDetails = (item: Transaction) => {
        const isUserEmiter = item.emiter === user;
        const isStealCompleted = item.type === 'steal' && item.state === 'completed';
        const isPendingPetition = item.type === 'petition' && item.state !== 'completed';

        let amountColor = isUserEmiter ? '#a50000ff' : '#00a558ff';
        if (isPendingPetition) {
            amountColor = isDarkMode ? '#888' : '#999';
        }

        return {
            displayName: isUserEmiter ? item.receiver_name : item.emiter_name,
            sign: isUserEmiter ? '-' : '+',
            amountColor,
            isSuccessfulSteal: isStealCompleted && !isUserEmiter,
            isRobbedSteal: isStealCompleted && isUserEmiter,
        };
    };

    const getTransactionStyle = (details: ReturnType<typeof getTransactionDetails>, item: Transaction) => {
        if (details.isSuccessfulSteal) {
            return {
                background: isDarkMode ? '#224b45ff' : '#ede7f6ff',
                borderColor: '#149b41ff',
            };
        }
        if (details.isRobbedSteal) {
            return {
                background: isDarkMode ? '#3d1f1fff' : '#ffebee',
                borderColor: '#c62828',
            };
        }
        if (item.type === 'petition' && item.state !== 'completed') {
            return {
                background: isDarkMode ? '#232131ff' : '#e8e4f3',
                borderColor: 'transparent',
            };
        }
        return {
            background: isDarkMode ? '#1e1b4b' : '#f3f4f6',
            borderColor: 'transparent',
        };
    };

    const renderTransactionIcon = (item: Transaction, details: ReturnType<typeof getTransactionDetails>) => {
        const iconColor = isDarkMode ? '#aaa' : '#666';

        if (details.isRobbedSteal) {
            return (
                <>
                    <FontAwesome6 name="hand-holding" size={18} color={iconColor} style={{ transform: [{ scaleX: -1 }, { rotate: '180deg' }] }} iconStyle="solid" />
                    <FontAwesome6 name="sack-dollar" size={12} color='#ff3333' iconStyle="solid" />
                </>
            );
        }

        return (
            <>
                <FontAwesome6 name="sack-dollar" size={12} color={details.isSuccessfulSteal ? '#ffd700' : iconColor} iconStyle="solid" />
                {item.type === 'steal' ? (
                    <FontAwesome6 name="hand-holding" size={18} color={iconColor} style={{ transform: [{ rotate: '180deg' }] }} iconStyle="solid" />
                ) : (
                    <FontAwesome name={item.type === 'send' ? 'long-arrow-left' : 'long-arrow-right'} size={24} color={iconColor} />
                )}
            </>
        );
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const date = new Date(item.date + 'Z');
        const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const details = getTransactionDetails(item);
        const style = getTransactionStyle(details, item);

        const typeLabels: Record<string, string> = { send: 'Envío', steal: 'Robo', petition: 'Petición' };
        const stateLabels: Record<string, string> = { completed: 'Completado', pending: 'Pendiente', failed: 'Fallida', cancelled: 'Cancelado' };

        return (
            <View style={[styles.transactionItem, {
                backgroundColor: style.background,
                borderLeftWidth: style.borderColor !== 'transparent' ? 3 : 0,
                borderLeftColor: style.borderColor,
            }]}>
                <View style={styles.transactionInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.transactionEmail, { color: isDarkMode ? '#fff' : '#000' }]}>
                            {details.displayName}
                        </Text>
                        {renderTransactionIcon(item, details)}
                    </View>
                    <View style={styles.metadataRow}>
                        <Text style={[styles.transactionType, { color: isDarkMode ? '#aaa' : '#666' }]}>
                            {typeLabels[item.type] || item.type}
                        </Text>
                        <Text style={[styles.transactionState, { color: isDarkMode ? '#aaa' : '#666' }]}>
                            • {stateLabels[item.state] || item.state}
                        </Text>
                    </View>
                    <Text style={[styles.transactionDate, { color: isDarkMode ? '#888' : '#999' }]}>
                        {formattedDate} {formattedTime}
                    </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: details.amountColor }]}>
                    {details.sign}{parseFloat(item.amount).toFixed(2)} OLS
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
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    transactionEmail: {
        fontSize: 14,
        fontWeight: '600',
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
