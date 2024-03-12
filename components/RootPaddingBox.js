import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from '../stores';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

const RootPaddingBox = observer(({ navigation }) => {
  const { userStore } = useStores();
  console.log('userStore.contentColor : ', userStore.contentColor);
  return (
    <View>
      style=
      {{
        height: 1,
        backgroundColor: 'red',
        marginTop: -60,

        zIndex: 2,
      }}
      >
      <StatusBar style='dark' translucent={true} />
    </View>
  );
});

export default RootPaddingBox;
