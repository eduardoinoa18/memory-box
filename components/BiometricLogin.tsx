import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

interface BiometricLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function BiometricLogin({ onLoginSuccess }: BiometricLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<any>(null);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricSupport();
    checkSavedCredentials();
  }, []);

  const checkBiometricSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (hasHardware && isEnrolled) {
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      } else {
        setBiometricType('Biometric');
      }
    }
  };

  const checkSavedCredentials = async () => {
    try {
      const saved = await SecureStore.getItemAsync('userCredentials');
      if (saved) {
        const credentials = JSON.parse(saved);
        setSavedCredentials(credentials);
        setEmail(credentials.email);
      }
    } catch (error) {
      console.log('No saved credentials found');
    }
  };

  const handleBiometricAuth = async () => {
    if (!savedCredentials) {
      Alert.alert('No Saved Account', 'Please log in with your credentials first to enable biometric authentication.');
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Use ${biometricType} to sign in to Memory Box`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        // Biometric authentication successful
        setIsLoading(true);
        
        // Simulate login with saved credentials
        setTimeout(() => {
          onLoginSuccess({
            email: savedCredentials.email,
            name: savedCredentials.name || 'User',
            biometricLogin: true
          });
          setIsLoading(false);
        }, 1000);
      } else {
        // Biometric failed, show PIN option
        setShowPin(true);
      }
    } catch (error) {
      Alert.alert('Authentication Error', 'Biometric authentication failed. Please try again.');
    }
  };

  const handlePinAuth = async () => {
    if (pin === savedCredentials?.pin) {
      setIsLoading(true);
      setTimeout(() => {
        onLoginSuccess({
          email: savedCredentials.email,
          name: savedCredentials.name || 'User',
          pinLogin: true
        });
        setIsLoading(false);
      }, 500);
    } else {
      Alert.alert('Invalid PIN', 'Please enter the correct PIN.');
      setPin('');
    }
  };

  const handleEmailPasswordLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API login call
      // In production, this would call your authentication API
      setTimeout(async () => {
        if (email.includes('@') && password.length >= 6) {
          // Successful login
          const userData = {
            email,
            name: email.split('@')[0],
            id: Date.now().toString()
          };

          // Ask user if they want to save credentials for biometric login
          Alert.alert(
            'Save Login Info?',
            'Would you like to save your login for quick access with Face ID/Fingerprint?',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Yes', 
                onPress: () => setupBiometricLogin(userData)
              }
            ]
          );

          onLoginSuccess(userData);
        } else {
          Alert.alert('Login Failed', 'Invalid email or password.');
        }
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Login Error', 'Please try again.');
      setIsLoading(false);
    }
  };

  const setupBiometricLogin = async (userData: any) => {
    Alert.prompt(
      'Create PIN',
      'Create a 4-digit PIN as backup for biometric login',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async (pinInput) => {
            if (pinInput && pinInput.length === 4) {
              const credentials = {
                email: userData.email,
                name: userData.name,
                pin: pinInput,
                savedAt: new Date().toISOString()
              };
              
              await SecureStore.setItemAsync('userCredentials', JSON.stringify(credentials));
              setSavedCredentials(credentials);
              
              Alert.alert('Success', 'Biometric login has been set up! You can now use Face ID or your PIN to sign in quickly.');
            } else {
              Alert.alert('Invalid PIN', 'PIN must be 4 digits.');
            }
          }
        }
      ],
      'secure-text',
      '',
      'numeric'
    );
  };

  const clearSavedCredentials = async () => {
    Alert.alert(
      'Clear Saved Login?',
      'This will remove biometric login and you\'ll need to enter your credentials again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('userCredentials');
            setSavedCredentials(null);
            setEmail('');
            setShowPin(false);
            Alert.alert('Cleared', 'Saved login information has been removed.');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>📦</Text>
        <Text style={styles.title}>Memory Box</Text>
        <Text style={styles.subtitle}>Your Family's Digital Legacy</Text>
      </View>

      {savedCredentials && !showPin && (
        <View style={styles.biometricContainer}>
          <Text style={styles.welcomeBack}>Welcome back, {savedCredentials.email}</Text>
          
          {biometricType && (
            <TouchableOpacity 
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              disabled={isLoading}
            >
              <Ionicons 
                name={biometricType === 'Face ID' ? 'face-outline' : 'finger-print-outline'} 
                size={40} 
                color="#1976d2" 
              />
              <Text style={styles.biometricText}>
                Sign in with {biometricType}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.pinButton}
            onPress={() => setShowPin(true)}
          >
            <Text style={styles.pinButtonText}>Use PIN instead</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchAccountButton}
            onPress={clearSavedCredentials}
          >
            <Text style={styles.switchAccountText}>Switch Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {showPin && savedCredentials && (
        <View style={styles.pinContainer}>
          <Text style={styles.pinTitle}>Enter your PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            placeholder="••••"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            autoFocus
          />
          <TouchableOpacity 
            style={[styles.button, pin.length !== 4 && styles.buttonDisabled]}
            onPress={handlePinAuth}
            disabled={pin.length !== 4 || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowPin(false)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {(!savedCredentials || showPin) && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {savedCredentials ? 'Or sign in with email' : 'Sign In'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, (!email || !password) && styles.buttonDisabled]}
            onPress={handleEmailPasswordLogin}
            disabled={!email || !password || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  biometricContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeBack: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  biometricButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '100%',
  },
  biometricText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  pinButton: {
    padding: 10,
    marginBottom: 10,
  },
  pinButtonText: {
    color: '#1976d2',
    fontSize: 16,
  },
  switchAccountButton: {
    padding: 10,
  },
  switchAccountText: {
    color: '#666',
    fontSize: 14,
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  pinInput: {
    fontSize: 24,
    letterSpacing: 10,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1976d2',
    paddingBottom: 10,
    marginBottom: 30,
    width: 120,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 10,
    marginTop: 15,
  },
  backButtonText: {
    color: '#1976d2',
    fontSize: 16,
  },
});
