import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Dimensions,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/colors'; // 🎨 Renk sabitlerini al

const slides = [
    {
        id: '1',
        title: 'Hoş Geldin!',
        description:
            "Roomifies'a adım attığın için çok heyecanlıyız!\nEv arkadaşı arayışında sana en iyi deneyimi sunmak için buradayız.",
    },
    {
        id: '2',
        title: 'Nasıl Çalışır?',
        description:
            'Roomifies, kişisel özelliklerini, yaşam tarzını ve tercihlerini dikkate alarak sana en uygun ev arkadaşı eşleşmelerini sunar.\nSistem, doğru adayı bulmana yardım eder.',
    },
    {
        id: '3',
        title: 'Karakter Testi',
        description:
            'Ev arkadaşı adaylarını daha iyi tanımak için karakter testi hazırladık.\nTesti çözerek eşleşme kaliteni artırabilirsin.',
    },
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const flatListRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current.scrollToIndex({ index: nextIndex });
        } else {
            navigation.replace('Login');
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            flatListRef.current.scrollToIndex({ index: prevIndex });
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />


            {currentIndex > 0 && (
                <TouchableOpacity onPress={handlePrev} style={[styles.arrowButton, { left: 30 }]}>
                    <Feather name="arrow-left" size={28} color={Colors.white} />
                </TouchableOpacity>
            )}

            {currentIndex === slides.length - 1 ? (
                <TouchableOpacity onPress={handleNext} style={[styles.startButton, { right: 30 }]}>
                    <Text style={styles.startButtonText}>Hadi Başlayalım</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={handleNext} style={[styles.arrowButton, { right: 30 }]}>
                    <Feather name="arrow-right" size={28} color={Colors.white} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    slide: {
        width,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 17,
        lineHeight: 24,
        color: Colors.textDark,
        textAlign: 'center',
    },
    arrowButton: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: Colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    startButton: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: Colors.success,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    startButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
