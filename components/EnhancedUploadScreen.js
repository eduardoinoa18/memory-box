import React from 'react';
import { View, StyleSheet } from 'react-native';
import UploadMemory from './Upload/UploadMemory';

const EnhancedUploadScreen = ({ user, onUploadComplete, ...props }) => {
    const handleUploadComplete = (results) => {
        // Handle successful upload
        console.log('Upload completed:', results);
        onUploadComplete?.(results);
    };

    return (
        <View style={styles.container}>
            <UploadMemory
                user={user}
                folderId={null} // You can pass a specific folder ID if needed
                onUploadComplete={handleUploadComplete}
                onClose={null} // No close button needed since this is a full screen
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    }
});

export default EnhancedUploadScreen;