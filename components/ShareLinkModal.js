import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const theme = {
  colors: {
    primary: '#B3E5FC',
    primaryDark: '#1A237E',
    secondary: '#FFF9C4',
    success: '#4CAF50',
    error: '#F44336',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1A237E',
    textSecondary: '#546E7A',
  },
};

export default function ShareLinkModal({ visible, onClose, file, user }) {
  const [shareMessage, setShareMessage] = useState('Check out this memory I shared with you!');
  const [shareLink, setShareLink] = useState('');

  const generateShareLink = () => {
    const shareId = Math.random().toString(36).substr(2, 9);
    const link = `https://memorybox.app/shared/${shareId}?ref=${user?.id || 'guest'}`;
    setShareLink(link);
    return link;
  };

  const copyToClipboard = async (link) => {
    try {
      await Clipboard.setStringAsync(link);
      Alert.alert('Success', 'Share link copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const shareViaApp = async (link) => {
    try {
      await Share.share({
        message: `${shareMessage}\n\n${link}\n\nDownload Memory Box app to view and save your own memories!`,
        title: 'Memory Box - Shared Memory',
        url: link,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const openSMS = (link) => {
    const smsUrl = `sms:?body=${encodeURIComponent(`${shareMessage}\n\n${link}\n\nDownload Memory Box app to view and save your own memories!`)}`;
    Linking.openURL(smsUrl).catch(() => {
      Alert.alert('Error', 'Could not open SMS app');
    });
  };

  const openEmail = (link) => {
    const emailUrl = `mailto:?subject=${encodeURIComponent('Memory Box - Shared Memory')}&body=${encodeURIComponent(`${shareMessage}\n\n${link}\n\nDownload Memory Box app to view and save your own memories!`)}`;
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Could not open email app');
    });
  };

  const handleShare = () => {
    const link = shareLink || generateShareLink();
    
    Alert.alert(
      'Share Memory',
      'How would you like to share this memory?',
      [
        { text: 'Copy Link', onPress: () => copyToClipboard(link) },
        { text: 'Share App', onPress: () => shareViaApp(link) },
        { text: 'SMS', onPress: () => openSMS(link) },
        { text: 'Email', onPress: () => openEmail(link) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Share Memory</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Share this memory with friends and family. They'll be able to view it and download the Memory Box app!
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Custom Message</Text>
            <TextInput
              style={styles.textInput}
              value={shareMessage}
              onChangeText={setShareMessage}
              placeholder="Add a personal message..."
              multiline
              numberOfLines={3}
            />
          </View>

          {shareLink ? (
            <View style={styles.linkContainer}>
              <Text style={styles.linkLabel}>Share Link:</Text>
              <Text style={styles.linkText}>{shareLink}</Text>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share" size={20} color="white" />
              <Text style={styles.shareButtonText}>Generate & Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              Shared links are valid for 30 days and can be accessed without an account.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  linkContainer: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
  },
  shareButton: {
    backgroundColor: theme.colors.primaryDark,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
});
