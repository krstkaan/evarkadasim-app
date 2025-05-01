import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from 'react-native';
import api from '../lib/api';
import { useNavigation } from '@react-navigation/native';

export default function CharacterTestScreen() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get('/character-test-questions');
                setQuestions(response.data);
            } catch (error) {
                console.error('Sorular alınamadı:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [currentIndex]: value });
    };

    const goNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Test tamamlandı → cevapları backend’e gönder
            const payload = Object.keys(answers).map((index) => ({
                question_id: questions[index].id,
                value: answers[index],
            }));

            try {
                await api.post('/character-test-submit', { answers: payload });
                Alert.alert('Test tamamlandı', 'Başarıyla kaydedildi.');
                navigation.replace('Home');
            } catch (error) {
                console.error('Test gönderilirken hata:', error);
                Alert.alert('Hata', 'Test gönderilemedi. Lütfen tekrar deneyin.');
            }
        }
    };

    const goBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#171790" />
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Henüz hiç test sorusu eklenmemiş.</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const selectedValue = answers[currentIndex];

    return (
        <View style={styles.container}>
            <Text style={styles.question}>{currentQuestion.question}</Text>

            {currentQuestion.options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionButton,
                            isSelected && styles.selectedOption,
                        ]}
                        onPress={() => handleAnswer(option.value)}
                    >
                        <Text style={styles.optionText}>{option.text}</Text>
                    </TouchableOpacity>
                );
            })}

            <View style={styles.navButtons}>
                {currentIndex > 0 && (
                    <TouchableOpacity onPress={goBack} style={styles.navButton}>
                        <Text style={styles.navButtonText}>← Geri</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={goNext}
                    disabled={selectedValue === undefined}
                    style={[
                        styles.navButton,
                        {
                            backgroundColor: selectedValue === undefined ? '#ccc' : '#36C055',
                        },
                    ]}
                >
                    <Text style={styles.navButtonText}>
                        {currentIndex === questions.length - 1 ? 'Bitir' : 'İleri →'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    question: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#171790',
    },
    optionButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#f5f5f5',
    },
    selectedOption: {
        backgroundColor: '#dceaf5',
        borderColor: '#2196f3',
    },
    optionText: {
        fontSize: 16,
        textAlign: 'center',
    },
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    navButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    navButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    error: {
        color: '#b71c1c',
        fontSize: 16,
    },
});
