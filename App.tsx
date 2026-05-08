import NativeAppLocationModule, {
  location,
} from './src/NativeAppLocationModule';
import NativeAppBiometricModule from './src/NativeAppBiometricModule';
import NativeAppDeviceInfo from './src/NativeAppDeviceInfo';
import NativeKeychainModule from './src/NativeKeychainModule';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,

  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export async function requestLocationPermission() {
  if (Platform.OS === 'ios') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const eventEmitter = new NativeEventEmitter(
  NativeModules.LocationModule,
);

const AUTH_TOKEN_KEY = 'auth_token';

const translations = {
  en: {
    title: 'Location Tracker',
    subtitle: 'Coordinates Only',
    startTracking: 'Start Navigation',
    stopTracking: 'Stop Navigation',
    bioTitle: '🔐 Biometric',
    checkAvailability: 'Check Availability',
    authenticate: 'Authenticate',
    keychainTitle: '🔑 Keychain',
    savedToken: 'Saved Token:',
    noToken: 'No token saved yet',
    tokenPlaceholder: 'Enter token...',
    saveToken: '💾 Save Token',
    readToken: '📖 Read Token',
    deleteToken: '🗑️ Delete Token',
    secureFlow: '— Secure Flow —',
    bioFetchToken: '🔐 Biometric → Fetch Token',
    wait: 'Wait...',
    saving: 'Saving...',
    reading: 'Reading...',
    deleting: 'Deleting...',
    tokenSaved: '✅ Token saved successfully',
    saveFailed: '❌ Save failed',
    tokenFetched: '✅ Token fetched',
    noTokenFound: '⚠️ No token found',
    tokenDeleted: '🗑️ Token deleted',
    deleteFailed: '❌ Delete failed',
    switchLang: 'हिंदी',
    authenticating: 'Authenticating...',
    authenticated: '✅ Authenticated',
    authFailed: '❌ Auth failed',
    checking: 'Checking...',
    authPrompt: 'Please authenticate to verify your identity',
    authPromptSecure: 'Authenticate to securely access your token',
    emptyTokenErr: 'Token cannot be empty',
    errPrefix: '❌ Error: ',
  },
  hi: {
    title: 'लोकेशन ट्रैकर',
    subtitle: 'केवल निर्देशांक',
    startTracking: 'नेविगेशन शुरू करें',
    stopTracking: 'नेविगेशन रोकें',
    bioTitle: '🔐 बायोमेट्रिक',
    checkAvailability: 'उपलब्धता जांचें',
    authenticate: 'प्रमाणित करें',
    keychainTitle: '🔑 कीचेन',
    savedToken: 'सुरक्षित टोकन:',
    noToken: 'कोई टोकन सुरक्षित नहीं है',
    tokenPlaceholder: 'टोकन दर्ज करें...',
    saveToken: '💾 टोकन सेव करें',
    readToken: '📖 टोकन पढ़ें',
    deleteToken: '🗑️ टोकन हटाएं',
    secureFlow: '— सुरक्षित प्रक्रिया —',
    bioFetchToken: '🔐 बायोमेट्रिक → टोकन प्राप्त करें',
    wait: 'प्रतीक्षा करें...',
    saving: 'सेव हो रहा है...',
    reading: 'पढ़ रहे हैं...',
    deleting: 'हटा रहे हैं...',
    tokenSaved: '✅ टोकन सफलतापूर्वक सेव हो गया',
    saveFailed: '❌ सेव विफल रहा',
    tokenFetched: '✅ टोकन प्राप्त हो गया',
    noTokenFound: '⚠️ कोई टोकन नहीं मिला',
    tokenDeleted: '🗑️ टोकन हटा दिया गया',
    deleteFailed: '❌ हटाना विफल रहा',
    switchLang: 'English',
    authenticating: 'प्रमाणित कर रहे हैं...',
    authenticated: '✅ प्रमाणित हो गया',
    authFailed: '❌ प्रमाणीकरण विफल',
    checking: 'जांच की जा रही है...',
    authPrompt: 'अपनी पहचान सत्यापित करने के लिए प्रमाणित करें',
    authPromptSecure: 'अपना सुरक्षित टोकन प्राप्त करने के लिए प्रमाणित करें',
    emptyTokenErr: 'टोकन खाली नहीं हो सकता',
    errPrefix: '❌ त्रुटि: ',
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    hi: { translation: translations.hi },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default function App() {
  const { t, i18n: i18nInstance } = useTranslation();

  const [info, setInfo] = useState<location | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState('');

  // ── Biometric state ──
  const [bioStatus, setBioStatus] = useState('');
  const [authResult, setAuthResult] = useState('');

  const [tokenInput, setTokenInput] = useState('');
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [keychainStatus, setKeychainStatus] = useState('');
  const [keychainLoading, setKeychainLoading] = useState(false);



  const getLocation = async () => {
    try {
      setLoading(true);
      setError('');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        return;
      }
      const response = await NativeAppLocationModule.getCurrentLocation();
      setInfo(response);
    } catch (e) {
      console.log(e);
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async () => {
    try {
      setError('');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        return;
      }
      NativeAppLocationModule.startTracking();
      setTracking(true);
    } catch (e) {
      console.log(e);
      setError('Failed to start tracking');
    }
  };

  const stopTracking = () => {
    NativeAppLocationModule.stopTracking();
    setTracking(false);
  };

  // ─────────────────────────────────────────
  // Biometric handlers
  // ─────────────────────────────────────────

  const checkBiometric = async () => {
    try {
      setBioStatus(t('checking'));
      const status = await NativeAppBiometricModule.isBiometricAvailable();
      setBioStatus(status);
    } catch (e: any) {
      setBioStatus(e.message || 'Error checking biometric');
    }
  };

  const handleAuthenticate = async () => {
    try {
      setAuthResult(t('authenticating'));
      const result = await NativeAppBiometricModule.authenticate(
        t('authPrompt'),
      );
      setAuthResult(result);
    } catch (e: any) {
      setAuthResult(e.message || 'Authentication failed');
    }
  };

  // ─────────────────────────────────────────
  // Keychain handlers
  // ─────────────────────────────────────────

  // Token save karo keychain mein
  const saveToken = async () => {
    if (!tokenInput.trim()) {
      Alert.alert('Error', t('emptyTokenErr'));
      return;
    }
    try {
      setKeychainLoading(true);
      setKeychainStatus(t('saving'));
      const success = await NativeKeychainModule.setItem(
        AUTH_TOKEN_KEY,
        tokenInput.trim(),
      );
      if (success) {
        setKeychainStatus(t('tokenSaved'));
        setTokenInput('');
        // Save ke baad turant read karo confirm karne ke liye
        await readToken();
      } else {
        setKeychainStatus(t('saveFailed'));
      }
    } catch (e: any) {
      setKeychainStatus(`${t('errPrefix')}${e.message}`);
    } finally {
      setKeychainLoading(false);
    }
  };

  // Keychain se token read karo
  const readToken = async () => {
    try {
      setKeychainLoading(true);
      setKeychainStatus(t('reading'));
      const token = await NativeKeychainModule.getItem(AUTH_TOKEN_KEY);
      if (token) {
        setSavedToken(token);
        setKeychainStatus(t('tokenFetched'));
      } else {
        setSavedToken(null);
        setKeychainStatus(t('noTokenFound'));
      }
    } catch (e: any) {
      setKeychainStatus(`${t('errPrefix')}${e.message}`);
    } finally {
      setKeychainLoading(false);
    }
  };

  // Token delete karo
  const deleteToken = async () => {
    try {
      setKeychainLoading(true);
      setKeychainStatus(t('deleting'));
      const success = await NativeKeychainModule.removeItem(AUTH_TOKEN_KEY);
      if (success) {
        setSavedToken(null);
        setKeychainStatus(t('tokenDeleted'));
      } else {
        setKeychainStatus(t('deleteFailed'));
      }
    } catch (e: any) {
      setKeychainStatus(`${t('errPrefix')}${e.message}`);
    } finally {
      setKeychainLoading(false);
    }
  };

  // Biometric verify karo, phir token dikhao
  // Real app mein yahi pattern use hota hai
  const authenticateAndFetchToken = async () => {
    try {
      setAuthResult(t('authenticating'));
      const result = await NativeAppBiometricModule.authenticate(
        t('authPromptSecure'),
      );

      if (result === 'SUCCESS') {
        setAuthResult(t('authenticated'));
        await readToken();
      } else {
        setAuthResult(t('authFailed'));
      }
    } catch (e: any) {
      setAuthResult(e.message || 'Authentication failed');
    }
  };

  // ─────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────

  useEffect(() => {
    getLocation();

    const subscription = eventEmitter.addListener(
      'onLocationUpdate',
      data => {
        console.log('LIVE LOCATION:', data);
        setInfo(data);
      },
    );

    return () => {
      subscription.remove();
      NativeAppLocationModule.stopTracking();
    };
  }, []);

  useEffect(() => {
    const logDeviceInfo = async () => {
      const deviceInfo = await NativeAppDeviceInfo.getDeviceInfo();
      console.log(deviceInfo);
    };
    logDeviceInfo();

    // App start pe existing token check karo
    readToken();
  }, []);

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.heading}>{t('title')}</Text>
          <TouchableOpacity 
            onPress={() => i18nInstance.changeLanguage(i18nInstance.language === 'en' ? 'hi' : 'en')} 
            style={styles.langBtn}>
            <Text style={styles.langBtnText}>{t('switchLang')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subHeading}>{t('subtitle')}</Text>
      </View>

      <ScrollView
        style={styles.bottomContainer}
        contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── LOCATION SECTION ── */}
        {loading ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📍 LAT: {info?.latitude?.toFixed(5)}
              </Text>
              <Text style={styles.infoText}>
                📍 LNG: {info?.longitude?.toFixed(5)}
              </Text>
            </View>

            {!tracking ? (
              <TouchableOpacity style={styles.startButton} onPress={startTracking}>
                <Text style={styles.buttonText}>{t('startTracking')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
                <Text style={styles.buttonText}>{t('stopTracking')}</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── BIOMETRIC SECTION ── */}
        <View style={[styles.infoBox, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>{t('bioTitle')}</Text>

          <TouchableOpacity style={styles.actionButton} onPress={checkBiometric}>
            <Text style={styles.buttonText}>{t('checkAvailability')}</Text>
          </TouchableOpacity>
          {bioStatus ? (
            <Text style={styles.resultText}>Status: {bioStatus}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4F46E5' }]}
            onPress={handleAuthenticate}>
            <Text style={styles.buttonText}>{t('authenticate')}</Text>
          </TouchableOpacity>
          {authResult ? (
            <Text style={styles.resultText}>Result: {authResult}</Text>
          ) : null}
        </View>

        {/* ── KEYCHAIN SECTION ── */}
        <View style={[styles.infoBox, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>{t('keychainTitle')}</Text>

          {/* Saved token display */}
          {savedToken ? (
            <View style={styles.tokenDisplay}>
              <Text style={styles.tokenLabel}>{t('savedToken')}</Text>
              <Text style={styles.tokenValue} numberOfLines={2}>
                {savedToken}
              </Text>
            </View>
          ) : (
            <Text style={styles.resultText}>{t('noToken')}</Text>
          )}

          {/* Token input */}
          <TextInput
            style={styles.input}
            placeholder={t('tokenPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={tokenInput}
            onChangeText={setTokenInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Action buttons */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#16A34A' }]}
            onPress={saveToken}
            disabled={keychainLoading}>
            <Text style={styles.buttonText}>
              {keychainLoading ? t('wait') : t('saveToken')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2563EB' }]}
            onPress={readToken}
            disabled={keychainLoading}>
            <Text style={styles.buttonText}>{t('readToken')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#DC2626' }]}
            onPress={deleteToken}
            disabled={keychainLoading}>
            <Text style={styles.buttonText}>{t('deleteToken')}</Text>
          </TouchableOpacity>

          {/* Biometric + Keychain combined flow */}
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{t('secureFlow')}</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#7C3AED' }]}
            onPress={authenticateAndFetchToken}
            disabled={keychainLoading}>
            <Text style={styles.buttonText}>
              {t('bioFetchToken')}
            </Text>
          </TouchableOpacity>

     
          {keychainStatus ? (
            <Text style={styles.resultText}>{keychainStatus}</Text>
          ) : null}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  heading: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subHeading: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 14,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    color: '#1D4ED8',
    fontWeight: '600',
    marginBottom: 6,
  },
  startButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  stopButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 14,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  resultText: {
    marginTop: 8,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  tokenDisplay: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  tokenLabel: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '700',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 13,
    color: '#1E3A8A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginTop: 16,
    marginBottom: 4,
  },
  dividerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
});