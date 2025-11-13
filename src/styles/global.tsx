import { StyleSheet } from 'react-native';

export const backgroundColor = 'rgb(28, 30, 37)';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: backgroundColor,
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    center: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    button: {
        backgroundColor: '#6366f1',
        borderRadius: 5,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})