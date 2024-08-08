import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '../stores';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

const RootPaddingBox = observer(({ navigation }) => {
  const { userStore } = useStores();

  return (
    <View
      style={{
        height: 60,
        backgroundColor: userStore.contentColor,
        marginTop: -60,

        zIndex: 2,
      }}>
      <StatusBar
        style={userStore.contentColor === 'F3F3F4' ? 'dark' : 'light'}
        translucent={true}
      />
    </View>
  );
});

export default RootPaddingBox;
