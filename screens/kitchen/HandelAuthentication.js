import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function HandelAuthentication({ navigation }) {
  const [authenticationType, setAuthenticationType] = useState(null);

  useEffect(() => {
    // checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasBiometrics = await LocalAuthentication.hasHardwareAsync();
    const hasEnrolledBiometrics = await LocalAuthentication.isEnrolledAsync();

    if (hasBiometrics && hasEnrolledBiometrics) {
      setAuthenticationType('biometrics');
    } else {
      setAuthenticationType('pin');
    }
  };

  const handleAuthentication = async () => {
    if (authenticationType === 'biometrics') {
      await authenticateWithBiometrics();
      navigation.navigate('Kitchen');
    } else {
      // Implement PIN code authentication logic here
      // For simplicity, let's just log a message
      console.log('Authenticate with PIN code');
      navigation.navigate('Kitchen');
    }
  };

  const authenticateWithBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with biometrics',
    });

    if (result.success) {
      // Biometric authentication successful
      console.log('Biometric authentication successful');
    } else {
      // Biometric authentication failed
      console.log('Biometric authentication failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Authentication Type: {authenticationType}</Text>
      <TouchableOpacity onPress={handleAuthentication}>
        <Text>Authenticate</Text>
      </TouchableOpacity>
    </View>
  );
}
