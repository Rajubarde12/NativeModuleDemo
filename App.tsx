import NativeAppLocationModule, {
  location,
} from './src/NativeAppLocationModule';
// import NativeAppBiometricModule from './src/NativeAppBiometricModule';
import NativeAppDeviceInfo from './src/NativeAppDeviceInfo';

import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export async function requestLocationPermission() {
  if (Platform.OS === 'ios') {
    return true; // Let iOS native handle authorization logic
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const eventEmitter = new NativeEventEmitter(
  NativeModules.LocationModule,
);

export default function App() {
  const [info, setInfo] =
    useState<location | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [tracking, setTracking] =
    useState(false);

  const [error, setError] =
    useState('');

  const [bioStatus, setBioStatus] =
    useState('');

  const [authResult, setAuthResult] =
    useState('');

  const getLocation = async () => {
    try {
      setLoading(true);

      setError('');

      const hasPermission =
        await requestLocationPermission();

      if (!hasPermission) {
        setError(
          'Location permission denied',
        );

        return;
      }

      const response =
        await NativeAppLocationModule.getCurrentLocation();

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

      const hasPermission =
        await requestLocationPermission();

      if (!hasPermission) {
        setError(
          'Location permission denied',
        );

        return;
      }

      NativeAppLocationModule.startTracking();

      setTracking(true);
    } catch (e) {
      console.log(e);

      setError(
        'Failed to start tracking',
      );
    }
  };

  const stopTracking = () => {
    NativeAppLocationModule.stopTracking();

    setTracking(false);
  };

  const checkBiometric = async () => {

    try {
      setBioStatus('Checking...');
      // const status = await NativeAppBiometricModule.isBiometricAvailable();
      setBioStatus("status");
    } catch (e: any) {
      console.log(e);
      setBioStatus(e.message || 'Error checking biometric');
    }
  };

  const handleAuthenticate = async () => {
    try {
      setAuthResult('Authenticating...');
      // const result = await NativeAppBiometricModule.authenticate(
      //   'Please authenticate to verify your identity',
      // );
      setAuthResult("result");
    } catch (e: any) {
      console.log(e);
      setAuthResult(e.message || 'Authentication failed');
    }
  };

  useEffect(() => {
    getLocation();

    const subscription =
      eventEmitter.addListener(
        'onLocationUpdate',
        data => {
          console.log(
            'LIVE LOCATION:',
            data,
          );

          setInfo(data);
        },
      );

    return () => {
      subscription.remove();

      NativeAppLocationModule.stopTracking();
    };
  }, []);


const logDeviceinfo=async()=>{
const info=await NativeAppDeviceInfo.getDeviceInfo();
console.log(info);
}
useEffect(()=>{
  logDeviceinfo();
},[])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0F172A"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>
           Location Tracker
        </Text>

        <Text style={styles.subHeading}>
          Coordinates Only
        </Text>
      </View>

      {/* BOTTOM PANEL */}
      <ScrollView style={styles.bottomContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : (
          <>
            {/* LOCATION INFO */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📍 LAT:{' '}
                {info?.latitude?.toFixed(5)}
              </Text>

              <Text style={styles.infoText}>
                📍 LNG:{' '}
                {info?.longitude?.toFixed(5)}
              </Text>
            </View>

            {/* START */}
            {!tracking ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startTracking}>
                <Text style={styles.buttonText}>
                  Start Navigation
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopTracking}>
                <Text style={styles.buttonText}>
                  Stop Navigation
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* BIOMETRIC TEST PANEL */}
        <View style={[styles.infoBox, { marginTop: 24 }]}>
          <Text style={[styles.infoText, { fontSize: 18, color: '#333' }]}>
            🔐 Biometric Test
          </Text>

          <TouchableOpacity style={styles.actionButton} onPress={checkBiometric}>
            <Text style={styles.buttonText}>Check Availability</Text>
          </TouchableOpacity>
          {bioStatus ? (
            <Text style={styles.resultText}>Status: {bioStatus}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4F46E5' }]}
            onPress={handleAuthenticate}>
            <Text style={styles.buttonText}>Authenticate</Text>
          </TouchableOpacity>
          {authResult ? (
            <Text style={styles.resultText}>Result: {authResult}</Text>
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
});