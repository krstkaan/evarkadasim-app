import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const BarItem = ({ itemText, itemLink, itemIcon, isActive }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate(itemLink)}
        >
            <FontAwesome5
                name={itemIcon}
                size={20}
                color={isActive ? '#171790' : '#888'}
            />
            <Text style={[styles.label, isActive && { color: '#171790' }]}>
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
        color: '#888',
    },
});
