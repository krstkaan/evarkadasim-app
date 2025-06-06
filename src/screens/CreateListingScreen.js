import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import Colors from '../constants/colors';
import CustomUserBottomBar from '../components/CustomUserBottomBar';
import { ActivityIndicator } from 'react-native';
import ListingGate from '../components/ListingGate';
import { FontAwesome } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const DROPDOWN_KEYS = [
    { key: 'roommate_gender_id', label: 'Ev arkadaşı cinsiyeti', endpoint: 'roommate-genders' },
    { key: 'age_range_id', label: 'Yaş aralığı', endpoint: 'age-ranges' },
    { key: 'house_type_id', label: 'Ev tipi', endpoint: 'house-types' },
    { key: 'furniture_status_id', label: 'Eşya durumu', endpoint: 'furniture-statuses' },
    { key: 'heating_type_id', label: 'Isıtma tipi', endpoint: 'heating-types' },
    { key: 'building_age_id', label: 'Bina yaşı', endpoint: 'building-ages' },
];

const STEP_MESSAGES = {
    1: 'Evini tanımlamaya görselle başlayalım!',
    2: 'Kiranı ve ev özelliklerini belirtelim.',
    3: 'Evin teknik detaylarını paylaşalım.',
    4: 'Nasıl bir ev arkadaşı arıyorsun?',
};




const StepOneComponent = React.memo(({ styles, step, images, pickImage, form, setForm, deleteImage }) => (
    <View style={styles.stepContainer}>
        <View style={styles.header}>
            <Text style={styles.stepCounter}>Adım {step} / 4</Text>
            <Text style={styles.headerText}>{STEP_MESSAGES[1]}</Text>
        </View>
        <View style={styles.formContainer}>
            <Text style={styles.label}>Görseller ({images.length}/3)</Text>
            <View style={styles.imageRow}>
                {images.map((img, i) => (
                    <View key={i} style={styles.imageCard}>
                        <Image source={{ uri: img.uri }} style={styles.image} />
                        <TouchableOpacity
                            style={styles.deleteImageButton}
                            onPress={() => deleteImage(i)}
                        >
                            <Text style={styles.deleteImageButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {images.length < 3 && (
                    <TouchableOpacity onPress={pickImage} style={styles.imageCardButton}>
                        <Text style={styles.imageButtonText}>+</Text>
                    </TouchableOpacity>
                )}
            </View>
            <TextInput
                style={styles.inputLarge}
                placeholder="Başlık"
                value={form.title}
                onChangeText={(text) => setForm(prevForm => ({ ...prevForm, title: text }))}
                autoCorrect={false}
            />
            <TextInput
                style={[styles.inputLarge, { height: 120, textAlignVertical: 'top' }]}
                multiline={true}
                placeholder="Açıklama"
                value={form.description}
                onChangeText={(text) => setForm(prevForm => ({ ...prevForm, description: text }))}
                autoCorrect={false}
            />
        </View>
    </View>
));

const StepTwoComponent = React.memo(({ styles, step, form, setForm, renderDropdown }) => (
    <View style={styles.stepContainer}>
        <View style={styles.header}>
            <Text style={styles.stepCounter}>Adım {step} / 4</Text>
            <Text style={styles.headerText}>{STEP_MESSAGES[2]}</Text>
        </View>
        <View style={styles.formContainer}>
            <TextInput
                style={styles.inputLarge}
                placeholder="Kira (₺)"
                keyboardType="numeric"
                value={form.rent_price}
                onChangeText={(text) => setForm(prevForm => ({ ...prevForm, rent_price: text }))}
            />
            <TextInput
                style={styles.inputLarge}
                placeholder="Metrekare (m²)"
                keyboardType="numeric"
                value={form.square_meters}
                onChangeText={(text) => setForm(prevForm => ({ ...prevForm, square_meters: text }))}
            />
            {renderDropdown('house_type_id')}
        </View>
    </View>
));

const StepThreeComponent = React.memo(({ styles, step, renderDropdown }) => (
    <View style={styles.stepContainer}>
        <View style={styles.header}>
            <Text style={styles.stepCounter}>Adım {step} / 4</Text>
            <Text style={styles.headerText}>{STEP_MESSAGES[3]}</Text>
        </View>
        <View style={styles.formContainer}>
            {renderDropdown('furniture_status_id')}
            {renderDropdown('heating_type_id')}
            {renderDropdown('building_age_id')}
        </View>
    </View>
));

const StepFourComponent = React.memo(({ styles, step, renderDropdown }) => (
    <View style={styles.stepContainer}>
        <View style={styles.header}>
            <Text style={styles.stepCounter}>Adım {step} / 4</Text>
            <Text style={styles.headerText}>{STEP_MESSAGES[4]}</Text>
        </View>
        <View style={styles.formContainer}>
            {renderDropdown('roommate_gender_id')}
            {renderDropdown('age_range_id')}
        </View>
    </View>
));

export default function CreateListingScreen({ navigation }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        rent_price: '',
        square_meters: '',
        roommate_gender_id: '',
        age_range_id: '',
        house_type_id: '',
        furniture_status_id: '',
        heating_type_id: '',
        building_age_id: '',
    });

    const [dropdowns, setDropdowns] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState('');
    const [images, setImages] = useState([]);
    const [step, setStep] = useState(1);

    const [myListing, setMyListing] = useState(null);
    const [loadingListing, setLoadingListing] = useState(true);

    useEffect(() => {
        const checkRoommateStatus = async () => {
            try {
                const response = await api.get('/me');
                if (response.data?.roommate) {
                    Alert.alert('Uyarı', 'Aktif bir ev arkadaşlığınız var. Yeni ilan oluşturamazsınız.');
                    navigation.replace('HomePage');
                }
            } catch (error) {
                console.log("Roommate durumu alınamadı:", error);
            }
        };

        const fetchMyListing = async () => {
            try {
                const response = await api.get('/listings/me');
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setMyListing(response.data[0]);
                    navigation.replace('MyListingsScreen');
                } else if (response.data && !Array.isArray(response.data)) {
                    setMyListing(response.data);
                    navigation.replace('MyListingsScreen');
                } else {
                    setMyListing(null);
                }
            } catch (error) {
                console.error('İlan kontrol hatası:', error);
                setMyListing(null);
            } finally {
                setLoadingListing(false);
            }
        };

        checkRoommateStatus();
        fetchMyListing();
    }, []);


    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const newData = {};
                for (const d of DROPDOWN_KEYS) {
                    const res = await api.get(`/dropdowns/${d.endpoint}`);
                    newData[d.key] = res.data;
                }
                setDropdowns(newData);
            } catch (error) {
                console.error("Dropdown verileri yüklenirken hata:", error);
            }
        };
        fetchDropdowns();
    }, []);

    const memoizedPickImage = useCallback(async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeriye erişim izni gerekiyor.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled && result.assets?.length) {
            console.log("ImagePicker result.assets[0]:", JSON.stringify(result.assets[0], null, 2));
            setImages(currentImages => {
                if (currentImages.length >= 3) {
                    Alert.alert('Uyarı', 'En fazla 3 görsel yükleyebilirsiniz.');
                    return currentImages;
                }
                return [...currentImages, result.assets[0]];
            });
        }
    }, []);

    const memoizedDeleteImage = useCallback((indexToDelete) => {
        setImages(currentImages => currentImages.filter((_, index) => index !== indexToDelete));
    }, []);

    const validateCurrentStep = useCallback(() => {
        let missingFieldsMessages = [];
        const getDropdownLabel = (key) => DROPDOWN_KEYS.find(d => d.key === key)?.label || key;

        switch (step) {
            case 1:
                if (images.length < 1) missingFieldsMessages.push("En az 1 görsel yüklemelisiniz.");
                if (!form.title.trim()) missingFieldsMessages.push("Başlık alanını doldurun.");
                if (!form.description.trim()) missingFieldsMessages.push("Açıklama alanını doldurun.");
                break;
            case 2:
                if (!form.rent_price.trim()) {
                    missingFieldsMessages.push("Kira bedelini girin.");
                } else if (isNaN(parseFloat(form.rent_price)) || parseFloat(form.rent_price) <= 0) {
                    missingFieldsMessages.push("Kira bedeli geçerli bir pozitif sayı olmalıdır.");
                }
                if (!form.square_meters.trim()) {
                    missingFieldsMessages.push("Metrekare bilgisini girin.");
                } else if (isNaN(parseFloat(form.square_meters)) || parseFloat(form.square_meters) <= 0) {
                    missingFieldsMessages.push("Metrekare geçerli bir pozitif sayı olmalıdır.");
                }
                if (!form.house_type_id) missingFieldsMessages.push(`${getDropdownLabel('house_type_id')} seçin.`);
                break;
            case 3:
                if (!form.furniture_status_id) missingFieldsMessages.push(`${getDropdownLabel('furniture_status_id')} seçin.`);
                if (!form.heating_type_id) missingFieldsMessages.push(`${getDropdownLabel('heating_type_id')} seçin.`);
                if (!form.building_age_id) missingFieldsMessages.push(`${getDropdownLabel('building_age_id')} seçin.`);
                break;
            case 4:
                if (!form.roommate_gender_id) missingFieldsMessages.push(`${getDropdownLabel('roommate_gender_id')} seçin.`);
                if (!form.age_range_id) missingFieldsMessages.push(`${getDropdownLabel('age_range_id')} seçin.`);
                break;
        }

        if (missingFieldsMessages.length > 0) {
            Alert.alert("Eksik veya Hatalı Bilgi", `Lütfen aşağıdaki alanları kontrol edin:\n\n- ${missingFieldsMessages.join("\n- ")}`);
            return false;
        }
        return true;
    }, [step, form, images]);

    const memoizedHandleSubmit = useCallback(async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            Alert.alert('Hata', 'Token bulunamadı.');
            return;
        }

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        images.forEach((img, i) => {
            const uriParts = img.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            const fileName = img.fileName || `image${i}.${fileType || 'jpg'}`;
            const mimeType = img.mimeType || `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

            formData.append('images[]', {
                uri: img.uri,
                name: fileName,
                type: mimeType,
            });
        });

        try {
            const response = await fetch('http://192.168.1.111:8000/api/listings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const json = await response.json();

            if (!response.ok) {
                console.error('Sunucu hatası:', json);
                Alert.alert('Hata', `Sunucu hatası: ${json.message || 'Bilinmeyen hata'}`);
            } else {
                Alert.alert('Başarılı', 'İlan onaylanmak üzere gönderildi.');
                navigation.goBack();
            }
        } catch (error) {
            console.error('İstek hatası:', error);
            Alert.alert('Hata', 'İlan oluşturulamadı. İnternet bağlantınızı kontrol edin.');
        }
    }, [form, images, navigation]);

    const handleNextOrSubmit = () => {
        if (!validateCurrentStep()) {
            return;
        }

        if (step < 4) {
            setStep(prevStep => prevStep + 1);
        } else {
            memoizedHandleSubmit();
        }
    };

    const memoizedRenderDropdown = useCallback((key) => {
        const dropdown = DROPDOWN_KEYS.find(d => d.key === key);
        if (!dropdown) return null;

        return (
            <View key={key} style={{ width: '100%' }}>
                <TouchableOpacity
                    style={styles.inputLarge}
                    onPress={() => setDropdownOpen(prevOpen => (prevOpen === key ? '' : key))}
                >
                    <Text style={form[key] ? {} : styles.placeholderText}>
                        {dropdowns[key]?.find(i => i.id == form[key])?.label || dropdown.label}
                    </Text>
                </TouchableOpacity>
                {dropdownOpen === key && (
                    <View style={styles.dropdown}>
                        {dropdowns[key]?.map(option => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => {
                                    setForm(prevForm => ({ ...prevForm, [key]: option.id }));
                                    setDropdownOpen('');
                                }}
                                style={styles.dropdownItem}
                            >
                                <Text>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    }, [dropdownOpen, dropdowns, form]);

    const renderStep = () => {
        switch (step) {
            case 1: return <StepOneComponent
                styles={styles}
                step={step}
                images={images}
                pickImage={memoizedPickImage}
                deleteImage={memoizedDeleteImage}
                form={form}
                setForm={setForm} />;
            case 2: return <StepTwoComponent styles={styles} step={step} form={form} setForm={setForm} renderDropdown={memoizedRenderDropdown} />;
            case 3: return <StepThreeComponent styles={styles} step={step} renderDropdown={memoizedRenderDropdown} />;
            case 4: return <StepFourComponent styles={styles} step={step} renderDropdown={memoizedRenderDropdown} />;
            default: return null;
        }
    };

    // Loading durumunu göster
    if (loadingListing) {
        return (
            <ListingGate navigation={navigation}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>İlan durumunuz kontrol ediliyor...</Text>
                </View>
                <CustomUserBottomBar navigation={navigation} />
            </ListingGate>
        );
    }

    // Normal ilan oluşturma formu
    return (
        <ListingGate navigation={navigation}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always">
                {renderStep()}
                <View style={styles.buttonContainer}>
                    {step > 1 && (
                        <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
                            <Text style={styles.backButtonText}>Geri</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.button, { flex: 1 }]}
                        onPress={handleNextOrSubmit}
                    >
                        <Text style={styles.buttonText}>
                            {step < 4 ? 'Devam Et' : 'İlanı Oluştur'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <CustomUserBottomBar navigation={navigation} />
        </ListingGate>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 0,
        paddingBottom: 130,
        backgroundColor: Colors.lightGray,
        minHeight: SCREEN_HEIGHT - 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        minHeight: SCREEN_HEIGHT - 80,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.primary,
        textAlign: 'center',
    },
    existingListingContainer: {
        flex: 1,
    },
    listingInfo: {
        padding: 20,
        gap: 16,
    },
    listingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
    },
    listingStatus: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.secondary,
        textAlign: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: Colors.lightGray,
        borderRadius: 8,
    },
    listingRent: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
    },
    listingDescription: {
        fontSize: 16,
        color: Colors.textDark,
        textAlign: 'center',
        lineHeight: 22,
    },
    backToHomeButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    backToHomeButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepContainer: {
        flexGrow: 1,
    },
    formContainer: {
        padding: 20,
        paddingTop: 30,
        gap: 16,
        flexGrow: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        gap: 10,
    },
    header: {
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        paddingVertical: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    stepCounter: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        opacity: 0.9,
    },
    headerText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inputLarge: {
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.grayBorder,
        padding: 16,
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: Colors.white,
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#A9A9A9',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: Colors.grayBorder,
        borderRadius: 8,
        width: '100%',
        backgroundColor: Colors.white,
        marginTop: 4,
        maxHeight: 200,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    imageRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    imageCard: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.grayBorder,
        backgroundColor: Colors.white,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    deleteImageButton: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    deleteImageButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    imageCardButton: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtonText: {
        color: Colors.white,
        fontSize: 28,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: Colors.secondary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: 80,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});