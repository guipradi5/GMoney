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
        paddingTop: 40,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
    },
})