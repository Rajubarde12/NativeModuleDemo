import NativeAppDeviceInfo from './src/NativeAppDeviceInfo';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function App() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    NativeAppDeviceInfo.getDeviceInfo().then(setInfo);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:'white' }}>
      <Text>Device: {info?.deviceName}</Text>
      <Text>OS: {info?.systemName} {info?.systemVersion}</Text>
      <Text>Model: {info?.model}</Text>
    </View>
  );
}
