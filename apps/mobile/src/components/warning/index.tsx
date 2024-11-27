import { useTheme } from '@src/themes/theme-provider';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Clipboard, TouchableOpacity, View } from 'react-native';
import OWIcon from '../ow-icon/ow-icon';
import { Text } from '../text';
import messaging from '@react-native-firebase/messaging';

export const WarningBox: FunctionComponent<{}> = ({}) => {
  const { colors } = useTheme();

  const [token, setToken] = useState('');
  // Request permission for notifications
  const requestUserPermission = async () => {
    const settings = await messaging().requestPermission();

    if (settings) {
      console.log('Permission granted!');
      getToken();
    }
  };

  // Get the device token
  const getToken = async () => {
    const token = await messaging().getToken();
    if (token) {
      console.log('Device Token:', token);
      setToken(token);
    }
  };

  useEffect(() => {
    // Call the function to request permission and get the device token
    requestUserPermission();
  }, []);

  return (
    <View
      style={{
        overflow: 'hidden',
        justifyContent: 'center',
        borderRadius: 8,
        margin: 16,
        marginBottom: 0
      }}
    >
      <View
        style={{
          borderRadius: 12,
          backgroundColor: colors['warning-surface-subtle'],
          padding: 12,
          borderWidth: 1,
          borderColor: colors['warning-border-default']
        }}
      >
        <View style={{ flexDirection: 'row', paddingBottom: 6, alignItems: 'center' }}>
          <OWIcon name="tdesignerror-triangle" color={colors['warning-text-body']} size={16} />
          <Text style={{ paddingLeft: 4 }} color={colors['warning-border-default']} weight="600" size={16}>
            Warning
          </Text>
        </View>
        <Text color={colors['warning-border-default']} weight="500" size={14}>
          {/* Please backup your mnemonic / private key! */}
          FCM Token for testing purpose:
        </Text>
        <Text color={colors['warning-border-default']} weight="500" size={14}>
          {token}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(token);
          }}
        >
          <Text>{'Copy'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
