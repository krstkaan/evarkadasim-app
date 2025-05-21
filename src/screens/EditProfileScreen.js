import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import api from '../lib/api';
import { setUser } from '../store/slices/userSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import Colors from '../constants/colors'; // 👈 Renk sabitlerini kullan
import { StatusBar } from 'expo-status-bar';

const BASE_URL = 'http://192.168.1.106:8000/api'; // 👈 Kendi backend URL'ini yaz

export default function EditProfileScreen({ navigation }) {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const [name, setName] = useState(user?.name || '');

    const rawTelefon = user?.telefon?.startsWith('+90')
        ? user.telefon.slice(3)
        : user?.telefon || '';
    const [telefon, setTelefon] = useState(rawTelefon);

    const formattedDogumTarihi = user?.dogum_tarihi
        ? moment(user.dogum_tarihi).format('YYYY-MM-DD')
        : '';
    const [dogumTarihi, setDogumTarihi] = useState(formattedDogumTarihi);

    const [gender, setGender] = useState(user?.gender || '');
    const [showGenderOptions, setShowGenderOptions] = useState(false);

    const genderOptions = [
        { label: 'Erkek', value: 'male' },
        { label: 'Kadın', value: 'female' },
        { label: 'Non-binary', value: 'non_binary' },
        { label: 'Belirtmek istemiyorum', value: 'prefer_not_to_say' },
    ];

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null); // Sadece lokal önizleme

    const handlePhotoUpload = async (localUri) => {
        const formData = new FormData();
        formData.append('photo', {
            uri: localUri,
            name: 'profile.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await api.post('/upload-profile-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            dispatch(setUser(response.data.user));
            Alert.alert('Başarılı', 'Profil fotoğrafınız yüklendi');
        } catch (error) {
            Alert.alert('Hata', 'Fotoğraf yüklenemedi');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const selectedUri = result.assets[0].uri;
            setAvatarUri(selectedUri);
            await handlePhotoUpload(selectedUri);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDogumTarihi(moment(selectedDate).format('YYYY-MM-DD'));
        }
    };

    const handleSave = async () => {
        try {
            const response = await api.post('/update-profile', {
                name,
                telefon: `+90${telefon}`,
                dogum_tarihi: dogumTarihi,
                gender,
            });

            dispatch(setUser(response.data.user));
            Alert.alert('Başarılı', 'Profiliniz güncellendi');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Hata', 'Profil güncellenemedi');
        }
    };

    return (
        <View style={styles.containerheader} statusbarStyle="dark-content">
            <StatusBar backgroundColor={Colors.background} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    <Image
                        source={
                            avatarUri
                                ? { uri: avatarUri }
                                : user?.profile_photo_url
                                    ? { uri: user.profile_photo_url }
                                    : require('../../assets/images/default-avatar.png')
                        }
                        style={styles.avatar}
                    />
                    <Text style={styles.avatarText}>Profil Fotoğrafını Değiştir</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Ad Soyad</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Telefon</Text>
                <View style={styles.phoneInputContainer}>
                    <Text style={styles.phonePrefix}>+90</Text>
                    <TextInput
                        style={styles.phoneInput}
                        value={telefon}
                        onChangeText={setTelefon}
                        keyboardType="phone-pad"
                        maxLength={10}
                        placeholder="5XXXXXXXXX"
                    />
                </View>

                <Text style={styles.label}>Doğum Tarihi</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <Text>{dogumTarihi || 'YYYY-MM-DD'}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={dogumTarihi ? new Date(dogumTarihi) : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}

                <Text style={styles.label}>Cinsiyet</Text>
                <TouchableOpacity
                    onPress={() => setShowGenderOptions(!showGenderOptions)}
                    style={styles.input}
                >
                    <Text>{genderOptions.find(opt => opt.value === gender)?.label || 'Seçiniz'}</Text>
                </TouchableOpacity>

                {showGenderOptions && (
                    <View style={styles.genderDropdown}>
                        {genderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => {
                                    setGender(option.value);
                                    setShowGenderOptions(false);
                                }}
                                style={[
                                    styles.genderOption,
                                    gender === option.value && styles.genderOptionSelected,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.genderOptionText,
                                        gender === option.value && styles.genderOptionTextSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Kaydet</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: Colors.white,
        paddingBottom: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    avatarText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    label: {
        marginBottom: 5,
        fontSize: 14,
        color: Colors.darkText,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.grayBorder,
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.grayBorder,
        borderRadius: 8,
        marginBottom: 15,
    },
    phonePrefix: {
        padding: 12,
        fontSize: 16,
        color: Colors.darkText,
        backgroundColor: Colors.lightGray,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    phoneInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    genderDropdown: {
        borderWidth: 1,
        borderColor: Colors.grayBorder,
        borderRadius: 8,
        marginTop: -10,
        marginBottom: 15,
        backgroundColor: Colors.white,
        overflow: 'hidden',
    },
    genderOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    genderOptionSelected: {
        backgroundColor: Colors.primaryLight,
    },
    genderOptionText: {
        fontSize: 16,
        color: Colors.darkText,
    },
    genderOptionTextSelected: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: Colors.secondary,
        paddingTop: 20,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
    },
    containerheader: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});

