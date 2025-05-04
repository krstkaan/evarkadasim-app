import React from 'react'
import { View, Text } from 'react-native'
import CustomUserBottomBar from '../components/CustomUserBottomBar'

function CreateAdvertisementScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Create Advertisement Screen</Text>
            <CustomUserBottomBar />
        </View>
    )
}

export default CreateAdvertisementScreen