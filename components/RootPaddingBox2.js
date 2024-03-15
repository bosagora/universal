import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';

const RootPaddingBox2 = observer(({ navigation }) => {
  return (
    <View
      style={{
        height: 60,
        backgroundColor: 'white',
        marginTop: -60,

        zIndex: 3,
      }}></View>
  );
});

export default RootPaddingBox2;
