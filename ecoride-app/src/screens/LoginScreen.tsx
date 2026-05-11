import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('E-mail adresi gerekli');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Geçerli bir e-mail girin');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Şifre gerekli');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalı');
      valid = false;
    }

    return valid;
  };

  const handleAuth = async () => {
    if (!validate()) {
      shakeForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setMessage('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isSignUp) {
        // Kayıt ol
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setEmailError(error.message);
          shakeForm();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          setMessage('✅ Kayıt başarılı! Giriş yapılıyor...');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Otomatik giriş yap
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (!loginError) {
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          }
        }
      } else {
        // Giriş yap
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login')) {
            setEmailError('E-mail veya şifre hatalı');
          } else {
            setEmailError(error.message);
          }
          shakeForm();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }
      }
    } catch (err) {
      setEmailError('Bir hata oluştu, tekrar dene');
    } finally {
      setIsLoading(false);
    }
  };

  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const logoOpacity = logoAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.5, 1] });
  const formOpacity = formAnim;
  const formTranslate = formAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#e8f7f1', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBg}
        >
          {/* Logo */}
          <Animated.View
            style={[
              styles.headerSection,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={['#1a9e6e', '#0d7a53']}
                style={styles.logoGradient}
              >
                <MaterialCommunityIcons name="bike" size={52} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>EcoRide</Text>
            <Text style={styles.slogan}>Çöp at, bisiklet kazan 🌿</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: formOpacity,
                transform: [
                  { translateY: formTranslate },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            <Text style={styles.formTitle}>
              {isSignUp ? 'Hesap Oluştur' : 'Hoş Geldin'}
            </Text>

            {/* Mesaj */}
            {message ? (
              <View style={styles.messageBanner}>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={emailError ? '#e53935' : '#1a9e6e'}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Şifre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={passwordError ? '#e53935' : '#1a9e6e'}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#bbb"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#aaa"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Giriş/Kayıt Butonu */}
            <TouchableOpacity
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.loginButtonWrapper}
            >
              <LinearGradient
                colors={isLoading ? ['#7dcbad', '#5bb898'] : ['#1a9e6e', '#0d7a53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Giriş/Kayıt geçişi */}
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setEmailError('');
                setPasswordError('');
                setMessage('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Zaten hesabın var mı? ' : 'Hesabın yok mu? '}
                <Text style={styles.switchLinkText}>
                  {isSignUp ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f7f1' },
  scroll: { flexGrow: 1 },
  gradientBg: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerSection: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 8,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1a9e6e',
    letterSpacing: 1,
    marginBottom: 6,
  },
  slogan: { fontSize: 15, color: '#555', fontStyle: 'italic' },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  messageBanner: {
    backgroundColor: 'rgba(26,158,110,0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  messageText: { color: '#1a9e6e', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  inputError: { borderColor: '#e53935' },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },
  errorText: { fontSize: 12, color: '#e53935', marginTop: 4, marginLeft: 4 },
  loginButtonWrapper: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  loginButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ececec' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#aaa' },
  switchButton: { alignItems: 'center' },
  switchText: { fontSize: 14, color: '#666' },
  switchLinkText: { color: '#1a9e6e', fontWeight: '700' },
});