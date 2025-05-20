import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Colors from '../constants/colors';

export default function ListingCard({ title, description, price, size, image, onPress }) {
    const fullImageUrl = `http://192.168.1.111:8000/storage/${image}`;


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
});
