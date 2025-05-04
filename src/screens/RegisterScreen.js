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
    Image,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { parseLaravelErrors } from '../lib/utils';
import logo from '../../assets/images/roomiefiesLogo.png';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';
import Colors from '../constants/colors';

export default function RegisterScreen({ navigation }) {
    const [adsoyad, setadsoyad] = useState('');
    const [email, setEmail] = useState('');
    const [telefon, setTelefon] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const dispatch = useDispatch();

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
            dispatch(setUser(me.data));

            if (!me.data.dogum_tarihi || !me.data.gender || !me.data.il || !me.data.ilce) {
                navigation.reset();
            } else if (!me.data.character_test_done) {
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
                <View style={styles.container}>
                    {/* ✅ LOGO */}
                    <Image source={logo} style={styles.logo} />

                    <Text style={styles.title}>Kayıt Ol</Text>

                    {errorMessage ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <TextInput
                        placeholder="Ad Soyad"
                        value={adsoyad}
                        onChangeText={setadsoyad}
                        style={styles.input}
                        placeholderTextColor={Colors.textLight}
                    />

                    <TextInput
                        placeholder="E-posta"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        placeholderTextColor={Colors.textLight}
                    />

                    {/* +90 sabitli telefon input */}
                    <View style={styles.phoneContainer}>
                        <View style={styles.phonePrefix}>
                            <Text style={styles.phonePrefixText}>+90</Text>
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
                            style={styles.phoneInput}
                            placeholderTextColor={Colors.textLight}
                        />
                    </View>

                    <TextInput
                        placeholder="Şifre"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        placeholderTextColor={Colors.textLight}
                    />

                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text style={styles.buttonText}>Kayıt Ol</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
                        <Text style={styles.linkText}>Zaten hesabın var mı? Giriş Yap</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: Colors.white,
    },
    logo: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.cardBackground,
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        color: Colors.textDark,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    phonePrefix: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#eee',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        borderWidth: 1,
        borderRightWidth: 0,
        borderColor: Colors.borderLight,
    },
    phonePrefixText: {
        fontSize: 16,
        color: Colors.textDark,
    },
    phoneInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.cardBackground,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
        color: Colors.textDark,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    linkText: {
        textAlign: 'center',
        color: Colors.secondary,
        fontWeight: '500',
    },
    errorBox: {
        backgroundColor: '#fdecea',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 14,
    },
});
