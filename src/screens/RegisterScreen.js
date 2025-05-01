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
import api from '../lib/api';
import { parseLaravelErrors } from '../lib/utils';

export default function RegisterScreen({ navigation }) {
    const [adsoyad, setadsoyad] = useState('');
    const [email, setEmail] = useState('');
    const [telefon, setTelefon] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    const handleRegister = async () => {
        try {
            const response = await api.post('/register', {
                adsoyad,
                email,
                telefon: `+90${telefon}`,
                password,
            });

            const { token } = response.data;
            await AsyncStorage.setItem('authToken', token);
            setErrorMessage('');

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
                    <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>Kayıt Ol</Text>
                    {errorMessage ? (
                        <View style={{ backgroundColor: '#fdecea', padding: 10, borderRadius: 8, marginBottom: 15 }}>
                            <Text style={{ color: '#b71c1c', fontSize: 14 }}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <TextInput
                        placeholder="Ad Soyad"
                        value={adsoyad}
                        onChangeText={setadsoyad}
                        style={inputStyle}
                    />

                    <TextInput
                        placeholder="E-posta"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={inputStyle}
                    />

                    {/* +90 sabitli telefon input */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                        <View
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                backgroundColor: '#eee',
                                borderTopLeftRadius: 8,
                                borderBottomLeftRadius: 8,
                                borderWidth: 1,
                                borderRightWidth: 0,
                                borderColor: '#ccc',
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>+90</Text>
                        </View>
                        <TextInput
                            placeholder="Telefon"
                            value={telefon}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                if (cleaned.length <= 10) setTelefon(cleaned);
                            }}
                            keyboardType="number-pad"
                            maxLength={10}
                            style={{
                                ...inputStyle,
                                flex: 1,
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                marginBottom: 0,
                            }}
                        />
                    </View>

                    <TextInput
                        placeholder="Şifre"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={inputStyle}
                    />

                    <TouchableOpacity onPress={handleRegister} style={buttonStyle}>
                        <Text style={buttonTextStyle}>Kayıt Ol</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
                        <Text style={{ textAlign: 'center', color: 'blue' }}>Zaten hesabın var mı? Giriş Yap</Text>
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
