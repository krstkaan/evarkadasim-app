import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Colors from '../constants/colors';
import { BASE_URL } from '../constants/config';

export default function ListingCard({ title, description, price, size, image, onPress, score }) {
    const fullImageUrl = `${BASE_URL}/storage/${image}`;


    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Image
                source={{ uri: fullImageUrl }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
                <Text style={styles.details}>{size} m² • {price}₺</Text>
                {score !== undefined && (
                    <Text style={styles.scoreText}>Uyum Skoru: {score.toFixed(1)}%</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
        elevation: 4,
        marginHorizontal: 5,
    },
    image: {
        width: '100%',
        height: 180,
    },
    info: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark,
    },
    description: {
        fontSize: 14,
        color: Colors.gray,
        marginVertical: 6,
    },
    details: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    scoreText: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '500',
        color: Colors.success, // Örneğin yeşil tonu için
    },
});
