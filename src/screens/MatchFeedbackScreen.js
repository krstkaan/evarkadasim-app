import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../lib/api';
import Colors from '../constants/colors';

export default function MatchFeedbackScreen({ route }) {
    const { toUserId, listingId } = route.params || {};
    const navigation = useNavigation();

    const [communicationScore, setCommunicationScore] = useState(3);
    const [sharingScore, setSharingScore] = useState(3);
    const [overallScore, setOverallScore] = useState(5);
    const [wouldLiveAgain, setWouldLiveAgain] = useState(true);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);

    // Gerekli parametrelerin kontrolü
    useEffect(() => {
        if (!toUserId || !listingId) {
            setValidationError('Gerekli bilgiler eksik. Lütfen tekrar deneyin.');
            console.log('Eksik parametreler:', { toUserId, listingId });
        } else {
            setValidationError(null);
        }
    }, [toUserId, listingId]);

    const submitFeedback = async () => {
        // Parametreleri tekrar kontrol et
        if (!toUserId || !listingId) {
            Alert.alert(
                'Hata', 
                'Gerekli bilgiler eksik. Lütfen ana sayfaya dönüp tekrar deneyin.',
                [{ text: 'Tamam', onPress: () => navigation.goBack() }]
            );
            return;
        }

        try {
            setSubmitting(true);
            
            // Gönderilecek veriyi logla
            const feedbackData = {
                to_user_id: toUserId,
                listing_id: listingId,
                communication_score: communicationScore,
                sharing_score: sharingScore,
                overall_score: overallScore,
                would_live_again: wouldLiveAgain,
                comment,
            };
            
            console.log('=== GERİ BİLDİRİM GÖNDERİMİ BAŞLIYOR ===');
            console.log('Route params:', { toUserId, listingId });
            console.log('Gönderilecek veri:', feedbackData);
            console.log('API base URL:', api.defaults?.baseURL || 'Base URL tanımlı değil');
            
            const response = await api.post('/match-feedbacks', feedbackData);
            
            console.log('=== GERİ BİLDİRİM BAŞARILI ===');
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            
            Alert.alert('Teşekkürler', 'Geri bildiriminiz kaydedildi', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
            
        } catch (error) {
            console.log('=== GERİ BİLDİRİM HATASI ===');
            console.log('Error object:', error);
            console.log('Error message:', error.message);
            console.log('Error code:', error.code);
            
            if (error.response) {
                // Sunucudan gelen hata
                console.log('Response error status:', error.response.status);
                console.log('Response error data:', error.response.data);
                console.log('Response error headers:', error.response.headers);
                
                Alert.alert(
                    'Hata', 
                    `Sunucu hatası (${error.response.status}): ${
                        error.response.data?.message || 
                        error.response.data?.error || 
                        'Bilinmeyen hata'
                    }`
                );
            } else if (error.request) {
                // İstek gönderildi ama yanıt alınamadı
                console.log('Request error:', error.request);
                Alert.alert('Hata', 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
            } else {
                // İstek hazırlanırken hata
                console.log('Setup error:', error.message);
                Alert.alert('Hata', `İstek hatası: ${error.message}`);
            }
            
            // Network durumunu kontrol et
            console.log('Network reachable:', await checkNetworkConnection());
            
        } finally {
            setSubmitting(false);
        }
    };

    // Network bağlantısını kontrol etmek için yardımcı fonksiyon
    const checkNetworkConnection = async () => {
        try {
            const response = await fetch('https://www.google.com', { 
                method: 'HEAD',
                timeout: 5000 
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const renderStars = (score, setScore, max = 5) => (
        <View style={styles.starContainer}>
            <View style={max > 5 ? styles.starRowDouble : styles.starRow}>
                {[...Array(max)].map((_, i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => setScore(i + 1)}
                        style={styles.starButton}
                    >
                        <AntDesign
                            name={i < score ? 'star' : 'staro'}
                            size={max > 5 ? 20 : 24}
                            color={i < score ? Colors.primary : Colors.borderLight}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.scoreText}>{score}/{max}</Text>
        </View>
    );

    const FeedbackSection = ({ title, children }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    // Validasyon hatası varsa hata mesajı göster
    if (validationError) {
        return (
            <View style={styles.errorContainer}>
                <AntDesign name="exclamationcircle" size={60} color={Colors.danger} />
                <Text style={styles.errorTitle}>Hata</Text>
                <Text style={styles.errorText}>{validationError}</Text>
                <TouchableOpacity
                    style={styles.errorButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.errorButtonText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Arkadaşlık Değerlendirmesi</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <FeedbackSection title="İletişim Becerisi">
                    {renderStars(communicationScore, setCommunicationScore)}
                </FeedbackSection>

                <FeedbackSection title="Paylaşım Uyumu">
                    {renderStars(sharingScore, setSharingScore)}
                </FeedbackSection>

                <FeedbackSection title="Genel Uyum">
                    {renderStars(overallScore, setOverallScore, 10)}
                </FeedbackSection>

                <FeedbackSection title="Tekrar birlikte yaşamak ister miydiniz?">
                    <View style={styles.booleanContainer}>
                        <TouchableOpacity
                            onPress={() => setWouldLiveAgain(true)}
                            style={[
                                styles.booleanButton,
                                wouldLiveAgain ? styles.booleanButtonActive : styles.booleanButtonInactive
                            ]}
                        >
                            <AntDesign
                                name="checkcircle"
                                size={20}
                                color={wouldLiveAgain ? Colors.white : Colors.borderLight}
                            />
                            <Text style={[
                                styles.booleanText,
                                wouldLiveAgain ? styles.booleanTextActive : styles.booleanTextInactive
                            ]}>
                                Evet
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setWouldLiveAgain(false)}
                            style={[
                                styles.booleanButton,
                                !wouldLiveAgain ? styles.booleanButtonActive : styles.booleanButtonInactive
                            ]}
                        >
                            <AntDesign
                                name="closecircle"
                                size={20}
                                color={!wouldLiveAgain ? Colors.white : Colors.borderLight}
                            />
                            <Text style={[
                                styles.booleanText,
                                !wouldLiveAgain ? styles.booleanTextActive : styles.booleanTextInactive
                            ]}>
                                Hayır
                            </Text>
                        </TouchableOpacity>
                    </View>
                </FeedbackSection>

                <FeedbackSection title="Yorum (isteğe bağlı)">
                    <TextInput
                        style={styles.commentBox}
                        placeholder="Eklemek istediğiniz bir şey var mı?"
                        placeholderTextColor={Colors.textLight}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </FeedbackSection>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={submitFeedback}
                    disabled={submitting}
                >
                    <Text style={styles.submitText}>
                        {submitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    header: {
        backgroundColor: Colors.primaryLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 15,
    },
    starContainer: {
        alignItems: 'center',
    },
    starRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    starButton: {
        padding: 3,
        marginHorizontal: 1,
    },
    scoreText: {
        fontSize: 14,
        color: Colors.textLight,
        fontWeight: '500',
    },
    booleanContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    booleanButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
    },
    booleanButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    booleanButtonInactive: {
        backgroundColor: Colors.white,
        borderColor: Colors.borderLight,
    },
    booleanText: {
        fontWeight: '600',
        fontSize: 14,
    },
    booleanTextActive: {
        color: Colors.white,
    },
    booleanTextInactive: {
        color: Colors.textLight,
    },
    commentBox: {
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 12,
        padding: 15,
        backgroundColor: Colors.white,
        fontSize: 14,
        color: Colors.textDark,
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    submitButtonDisabled: {
        backgroundColor: Colors.borderLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    starRowDouble: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 8,
        maxWidth: '100%',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.danger,
        marginTop: 20,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 16,
        color: Colors.textDark,
        textAlign: 'center',
        marginBottom: 30,
    },
    errorButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    errorButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});