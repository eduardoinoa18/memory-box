import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './AllComponents';
import prizeoutConfig from '../lib/prizeoutConfig';

const GiftCardRedeemer = ({ user, visible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [redemptionUrl, setRedemptionUrl] = useState(null);
  const [step, setStep] = useState('amount'); // 'amount', 'redeem', 'processing'

  const predefinedAmounts = [10, 25, 50, 100, 250];

  useEffect(() => {
    if (visible && user?.uid) {
      fetchUserBalance();
    }
  }, [visible, user?.uid]);

  const fetchUserBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prizeout/balance?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.balance);
      } else {
        Alert.alert('Error', 'Failed to fetch balance');
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      Alert.alert('Error', 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (amount) => {
    if (balance && amount > balance.totalAvailable) {
      Alert.alert(
        'Insufficient Balance',
        `You need $${amount} but only have $${balance.totalAvailable.toFixed(2)} available.`,
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedAmount(amount);
  };

  const startRedemption = async () => {
    if (!selectedAmount) {
      Alert.alert('Error', 'Please select an amount');
      return;
    }

    try {
      setLoading(true);
      setStep('processing');

      const response = await fetch('/api/prizeout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          amount: selectedAmount
        })
      });

      const data = await response.json();

      if (data.success) {
        setRedemptionUrl(data.launchUrl);
        setStep('redeem');
      } else {
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Redemption start error:', error);
      Alert.alert('Error', error.message || 'Failed to start redemption');
      setStep('amount');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'success':
          setStep('amount');
          setRedemptionUrl(null);
          setSelectedAmount(null);
          onSuccess?.(message.data);
          Alert.alert(
            'Success! 🎉',
            `Your $${selectedAmount} gift card is ready! Check your email for details.`,
            [{ text: 'Awesome!' }]
          );
          break;
        case 'error':
          Alert.alert('Error', message.error || 'Redemption failed');
          setStep('amount');
          break;
        case 'cancel':
          setStep('amount');
          setRedemptionUrl(null);
          break;
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  };

  const getBonusAmount = (amount) => {
    return amount * (prizeoutConfig.bonusPercentage / 100);
  };

  const getTotalValue = (amount) => {
    return amount + getBonusAmount(amount);
  };

  const renderAmountSelection = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Redeem Gift Cards</Text>
        <Text style={styles.subtitle}>
          Get {prizeoutConfig.bonusPercentage}% bonus value on all gift cards!
        </Text>
      </View>

      {balance && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${balance.totalAvailable.toFixed(2)}</Text>
          <View style={styles.balanceBreakdown}>
            <Text style={styles.balanceDetail}>
              Credits: ${balance.credits.toFixed(2)} • Points: ${balance.points.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.amountsContainer}>
        <Text style={styles.sectionTitle}>Select Amount</Text>
        <View style={styles.amountGrid}>
          {predefinedAmounts.map((amount) => {
            const isSelected = selectedAmount === amount;
            const isAffordable = balance && amount <= balance.totalAvailable;
            const bonusAmount = getBonusAmount(amount);
            const totalValue = getTotalValue(amount);

            return (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountCard,
                  isSelected && styles.amountCardSelected,
                  !isAffordable && styles.amountCardDisabled
                ]}
                onPress={() => handleAmountSelect(amount)}
                disabled={!isAffordable}
              >
                <Text style={[
                  styles.amountValue,
                  isSelected && styles.amountValueSelected,
                  !isAffordable && styles.amountValueDisabled
                ]}>
                  ${amount}
                </Text>
                <View style={styles.bonusContainer}>
                  <Text style={[
                    styles.bonusText,
                    isSelected && styles.bonusTextSelected,
                    !isAffordable && styles.bonusTextDisabled
                  ]}>
                    +${bonusAmount.toFixed(0)} bonus
                  </Text>
                  <Text style={[
                    styles.totalText,
                    isSelected && styles.totalTextSelected,
                    !isAffordable && styles.totalTextDisabled
                  ]}>
                    = ${totalValue.toFixed(0)} value
                  </Text>
                </View>
                {!isAffordable && (
                  <View style={styles.insufficientBadge}>
                    <Ionicons name="lock-closed" size={12} color="#999" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.redeemButton,
          !selectedAmount && styles.redeemButtonDisabled
        ]}
        onPress={startRedemption}
        disabled={!selectedAmount || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="gift" size={24} color="white" />
            <Text style={styles.redeemButtonText}>
              Redeem ${selectedAmount} Gift Card
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderWebView = () => (
    <View style={styles.webViewContainer}>
      <View style={styles.webViewHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setStep('amount');
            setRedemptionUrl(null);
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.webViewTitle}>Complete Your Redemption</Text>
      </View>
      <WebView
        source={{ uri: redemptionUrl }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading gift card options...</Text>
          </View>
        )}
      />
    </View>
  );

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.processingText}>Setting up your redemption...</Text>
      <Text style={styles.processingSubtext}>This will only take a moment</Text>
    </View>
  );

  if (!prizeoutConfig.enabled) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={styles.container}>
          <View style={styles.disabledContainer}>
            <Ionicons name="construct" size={64} color="#ccc" />
            <Text style={styles.disabledTitle}>Coming Soon!</Text>
            <Text style={styles.disabledText}>
              Gift card redemption is currently being set up. Check back soon!
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {step === 'amount' && renderAmountSelection()}
        {step === 'processing' && renderProcessing()}
        {step === 'redeem' && renderWebView()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  balanceBreakdown: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  balanceDetail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  amountsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  amountCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  amountCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  amountCardDisabled: {
    opacity: 0.5,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  amountValueSelected: {
    color: theme.colors.primary,
  },
  amountValueDisabled: {
    color: '#999',
  },
  bonusContainer: {
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
  bonusTextSelected: {
    color: theme.colors.primary,
  },
  bonusTextDisabled: {
    color: '#999',
  },
  totalText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  totalTextSelected: {
    color: theme.colors.primary,
  },
  totalTextDisabled: {
    color: '#999',
  },
  insufficientBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  redeemButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  processingSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  disabledText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default GiftCardRedeemer;
