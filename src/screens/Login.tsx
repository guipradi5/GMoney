import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/global';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function LoginScreen() {
    
    
        type RootStackParamList = {
            Home: undefined;
        };
        const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
        
  const safeAreaInsets = useSafeAreaInsets();
  const [text, setText] = useState('');

  return (
    <View style={[globalStyles.container, { paddingTop: safeAreaInsets.top }]}>
      <View style={[globalStyles.content, globalStyles.center]}>
        <Text style={{ fontSize: 12, marginBottom: 10, color: '#fff' }}>Login</Text>
        <TextInput
          placeholder="Type here to translate!"
          onChangeText={newText => setText(newText)}
          defaultValue={text}
          style={styles.textInput}
        />
        
        <Text style={{ fontSize: 12, marginTop: 20, color: '#fff' }}>Password</Text>
        <TextInput
          placeholder="Type here to translate!"
          onChangeText={newText => setText(newText)}
          defaultValue={text}
          style={[styles.textInput, { marginTop: 20 }]}
        />
        <Pressable
          style={[globalStyles.button, { marginTop: 20 }]}
          onPress={() =>
            navigation.navigate('Home')
          }
        >
          <Text style={globalStyles.buttonText}>Submit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    padding: 5,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    width: '100%',
  },
  text: { padding: 10, fontSize: 42 },
});
