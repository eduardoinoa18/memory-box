import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MemoryBoxLogo } from './AllComponents';
import authService from '../services/authService';
import demoDataService from '../services/demoDataService';

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isDemoMode = demoDataService.isDemoMode();

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      let userData;
      
      if (isDemoMode) {
        // Demo mode - automatically sign in with demo user
        userData = await demoDataService.signInDemo();
        Alert.alert(
          'Demo Mode Active',
          'Welcome to Memory Box Demo! You can explore all features with sample data.',
          [{ text: 'Continue', onPress: () => onLogin(userData) }]
        );
        return;
      }

      if (isLogin) {
        userData = await authService.signIn(email, password);
        Alert.alert('Welcome Back!', `Good to see you again, ${userData.name}!`);
      } else {
        userData = await authService.signUp(email, password, name);
        Alert.alert('Welcome!', `Account created successfully! Welcome to Memory Box, ${name}!`);
      }

      onLogin(userData);
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        'Authentication Error',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const demoUser = await demoDataService.signInDemo();
      Alert.alert(
        'Demo Mode',
        'Welcome to the Memory Box demo! Explore all features with sample family data.',
        [{ text: 'Start Demo', onPress: () => onLogin(demoUser) }]
      );
    } catch (error) {
      Alert.alert('Demo Error', 'Unable to start demo mode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first');
      return;
    }

    Alert.alert(
      'Reset Password',
      `We'll send a password reset link to ${email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Link', 
          onPress: async () => {
            try {
              if (!isDemoMode) {
                await authService.resetPassword(email);
              }
              Alert.alert('Email Sent', 'Check your email for password reset instructions');
            } catch (error) {
              Alert.alert('Error', 'Unable to send reset email');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <MemoryBoxLogo size={80} animated={true} />
              <Text style={styles.title}>Memory Box</Text>
              <Text style={styles.subtitle}>
                {isDemoMode ? 'Demo Version - Explore All Features' : 'Your Digital Family Legacy'}
              </Text>
            </View>

            {/* Auth Form */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                {/* Toggle Buttons */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[styles.toggleButton, isLogin && styles.activeToggle]}
                    onPress={() => setIsLogin(true)}
                  >
                    <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, !isLogin && styles.activeToggle]}
                    onPress={() => setIsLogin(false)}
                  >
                    <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Name Field (Sign Up) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                )}

                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isDemoMode ? "demo@memorybox.app (demo)" : "Email Address"}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    editable={!isDemoMode}
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isDemoMode ? "••••••••• (demo)" : "Password"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleAuth}
                    editable={!isDemoMode}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Demo Mode Alert */}
                {isDemoMode && (
                  <View style={styles.demoAlert}>
                    <Ionicons name="information-circle" size={16} color="#ff6b6b" />
                    <Text style={styles.demoText}>
                      Demo mode active - no real authentication required
                    </Text>
                  </View>
                )}

                {/* Auth Button */}
                <TouchableOpacity
                  style={[styles.authButton, isLoading && styles.disabledButton]}
                  onPress={isDemoMode ? handleDemoLogin : handleAuth}
                  disabled={isLoading}
                >
                  <Text style={styles.authButtonText}>
                    {isLoading ? 'Loading...' : isDemoMode ? 'Try Demo' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Text>
                </TouchableOpacity>

                {/* Demo Button (when not in demo mode) */}
                {!isDemoMode && (
                  <TouchableOpacity
                    style={styles.demoButton}
                    onPress={handleDemoLogin}
                    disabled={isLoading}
                  >
                    <Ionicons name="play-circle-outline" size={20} color="#667eea" />
                    <Text style={styles.demoButtonText}>Try Demo</Text>
                  </TouchableOpacity>
                )}

                {/* Forgot Password */}
                {isLogin && !isDemoMode && (
                  <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What you'll love:</Text>
                <View style={styles.feature}>
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                  <Text style={styles.featureText}>Secure photo & video storage</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="people-outline" size={16} color="#fff" />
                  <Text style={styles.featureText}>Family sharing & collaboration</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="sparkles-outline" size={16} color="#fff" />
                  <Text style={styles.featureText}>AI-powered letter writing</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="folder-outline" size={16} color="#fff" />
                  <Text style={styles.featureText}>Smart organization tools</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#667eea',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeToggleText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    padding: 8,
  },
  demoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  demoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  authButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotText: {
    color: '#667eea',
    fontSize: 16,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 12,
    opacity: 0.9,
  },
});

export default AuthScreen;
