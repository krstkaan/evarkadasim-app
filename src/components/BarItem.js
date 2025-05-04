import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/colors'; // 🎨 renkler

const BarItem = ({ itemText, itemLink, itemIcon, isActive }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate(itemLink)}>
            <FontAwesome5
                name={itemIcon}
                size={20}
                color={isActive ? Colors.primary : Colors.lightText}
            />
            <Text style={[styles.label, isActive && { color: Colors.primary }]}>
                {itemText}
            </Text>
        </TouchableOpacity>
    );
};

export default BarItem;

const styles = StyleSheet.create({
    item: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        marginTop: 4,
        color: Colors.lightText,
    },
});
