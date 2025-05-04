import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import api from '../lib/api';
import Colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';



export default function ProfileTestScreen() {
    const navigation = useNavigation();
    const [step, setStep] = useState(0);
    const [dogumTarihi, setDogumTarihi] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState('');
    const [ilId, setIlId] = useState('');
    const [ilceId, setIlceId] = useState('');
    const [iller, setIller] = useState([]);
    const [ilceler, setIlceler] = useState([]);
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.user.user);


    const genderOptions = [
        { label: 'Erkek', value: 'male', icon: 'male' },
        { label: 'Kadın', value: 'female', icon: 'female' },
        { label: 'Non-binary', value: 'non_binary', icon: 'body' },
        { label: 'Belirtmek istemiyorum', value: 'prefer_not_to_say', icon: 'help-circle-outline' },
    ];

    useEffect(() => {
        api.get('/cities').then((res) => setIller(res.data));
    }, []);

    useEffect(() => {
        if (ilId) {
            api.get(`/cities/${ilId}`).then((res) => setIlceler(res.data));
        } else {
            setIlceler([]);
            setIlceId('');
        }
    }, [ilId]);


    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                name: user.name, // 👈 redux'tan gelen ad
                dogum_tarihi: dogumTarihi,
                gender,
                il_id: ilId,
                ilce_id: ilceId,
            };
            console.log(payload);

            await api.post('/update-profile', payload);
            navigation.replace('CharacterTest');
        } catch (error) {
            if (error.response?.data?.errors) {
                console.log('Validation Hataları:', error.response.data.errors);
            } else {
                console.log('Profil testi hatası:', error);
            }
        } finally {
            setLoading(false);
        }
    };


    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Text style={styles.label}>Doğum Tarihi</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: Colors.textDark }}>
                                {dogumTarihi || 'YYYY-MM-DD'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={dogumTarihi ? new Date(dogumTarihi) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(e, selected) => {
                                    setShowDatePicker(false);
                                    if (selected) {
                                        setDogumTarihi(selected.toISOString().split('T')[0]);
                                    }
                                }}
                            />
                        )}
                    </>
                );
            case 1:
                return (
                    <>
                        <Text style={styles.label}>Cinsiyet Seç</Text>
                        <View style={styles.genderRow}>
                            {genderOptions.map((opt) => {
                                const selected = gender === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.genderOption,
                                            selected && styles.selectedGenderOption,
                                        ]}
                                        onPress={() => setGender(opt.value)}
                                    >
                                        <Ionicons
                                            name={opt.icon}
                                            size={42}
                                            color={selected ? Colors.primary : Colors.textLight}
                                        />
                                        <Text
                                            style={[
                                                styles.genderLabel,
                                                selected && {
                                                    color: Colors.primary,
                                                    fontWeight: 'bold',
                                                },
                                            ]}
                                        >
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                );
            case 2:
                return (
                    <>
                        <Text style={styles.label}>İl</Text>
                        <View style={styles.input}>
                            <Picker
                                selectedValue={ilId}
                                onValueChange={(itemValue) => setIlId(itemValue)}
                            >
                                <Picker.Item label="Seçiniz..." value="" />
                                {iller.map((il) => (
                                    <Picker.Item
                                        key={il.id}
                                        label={il.SehirIlceMahalleAdi}
                                        value={il.id}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>İlçe</Text>
                        <View style={styles.input}>
                            <Picker
                                selectedValue={ilceId}
                                onValueChange={(itemValue) => setIlceId(itemValue)}
                                enabled={ilceler.length > 0}
                            >
                                <Picker.Item label="Seçiniz..." value="" />
                                {ilceler.map((ilce) => (
                                    <Picker.Item
                                        key={ilce.id}
                                        label={ilce.SehirIlceMahalleAdi}
                                        value={ilce.id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </>
                );
        }
    };

    const handleNext = () => {
        if (step === 0 && (!dogumTarihi || isNaN(Date.parse(dogumTarihi)) || new Date(dogumTarihi) > new Date())) {
            alert('Lütfen geçerli bir doğum tarihi seçin.');
            return;
        }
        

        if (step === 1 && !gender) {
            alert('Lütfen cinsiyet seçin.');
            return;
        }

        if (step === 2 && (!ilId || !ilceId)) {
            alert('Lütfen il ve ilçe seçimini tamamlayın.');
            return;
        }

        if (step < 2) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };


    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.centeredBox}>{renderStep()}</View>
            </ScrollView>

            <View style={styles.footer}>
                {step > 0 && (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={[styles.navButton, { backgroundColor: Colors.secondary }]}
                    >
                        <Text style={styles.navButtonText}>← Geri</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.navButton, { backgroundColor: Colors.success }]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.navButtonText}>
                            {step === 2 ? 'Tamamla' : 'İleri →'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingBottom: 120,
    },
    centeredBox: {
        justifyContent: 'center',
    },
    label: {
        marginBottom: 8,
        color: Colors.textDark,
        fontSize: 16,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: Colors.white,
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderColor: Colors.borderLight,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navButton: {
        flex: 1,
        marginHorizontal: 5,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    navButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        flexWrap: 'wrap',
        gap: 12,
    },
    genderOption: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        width: '45%',
        borderWidth: 1,
        borderColor: Colors.borderLight,
        marginBottom: 12,
    },
    selectedGenderOption: {
        backgroundColor: Colors.accent,
        borderColor: Colors.primary,
    },
    genderLabel: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
});
