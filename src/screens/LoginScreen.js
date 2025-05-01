import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api'; // ✅ Artık buradan alıyoruz
import { parseLaravelErrors } from '../lib/utils';


export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    const handleLogin = async () => {
        try {
            const response = await api.post('/login', {
                email,
                password,
            });

            const { token } = response.data;
            await AsyncStorage.setItem('authToken', token);
            setErrorMessage('');

            // ✅ Kullanıcı bilgilerini çek ve yönlendir
            const me = await api.get('/me');
            const user = me.data;

            if (!user.character_test_done) {
                navigation.replace('CharacterTest');
            } else {
                navigation.replace('Home');
            }
        } catch (error) {
            setErrorMessage(parseLaravelErrors(error));
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>Giriş Yap</Text>
                    {errorMessage ? (
                        <View style={{ backgroundColor: '#fdecea', padding: 10, borderRadius: 8, marginBottom: 15 }}>
                            <Text style={{ color: '#b71c1c', fontSize: 14 }}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <TextInput placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={inputStyle} />
                    <TextInput placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry style={inputStyle} />

                    <TouchableOpacity onPress={handleLogin} style={buttonStyle}>
                        <Text style={buttonTextStyle}>Giriş Yap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
                        <Text style={{ textAlign: 'center', color: 'blue' }}>Hesabın yok mu? Kayıt Ol</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const inputStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
};

const buttonStyle = {
    backgroundColor: '#171790',
    padding: 12,
    borderRadius: 8,
};

const buttonTextStyle = {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
};
