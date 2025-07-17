import React from 'react';
import {
    Modal,
    View,
    StyleSheet
} from 'react-native';
import SmartUploadSystem from './SmartUploadSystem';

const UploadModal = ({ visible, onClose, user, folderId, onUploadComplete }) => {
    const handleUploadComplete = (results) => {
        onUploadComplete?.(results);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <SmartUploadSystem
                    user={user}
                    folderId={folderId}
                    onUploadComplete={handleUploadComplete}
                    onClose={onClose}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    }
});

export default UploadModal;
