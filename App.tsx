import NativeAppLocationModule, {
  location,
} from './src/NativeAppLocationModule';

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
      <View style={styles.bottomContainer}>
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
      </View>
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
});