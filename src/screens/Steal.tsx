import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AntDesign } from '@react-native-vector-icons/ant-design'
import { globalStyles } from '../styles/global';

export default function StealScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <View style={[globalStyles.container, { paddingTop: safeAreaInsets.top }]}>
            <View style={[globalStyles.content, { flexDirection: 'column', alignItems: 'center' }]}>
                <Text style={[globalStyles.greeting, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Robar tokens
                </Text>
                <AntDesign name="mobile" color="white" size={50} />
            </View>
        </View >
    );

}


const styles = StyleSheet.create({
    actionsRow: {
        marginTop: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});