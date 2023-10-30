import { Button, View, Text } from 'react-native';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import React from 'react';

const DetailsScreen = observer(({ navigation }) => {
  const { noteStore, userStore } = useStores();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen user : {userStore.name}</Text>
      <Button title='Go to Test' onPress={() => navigation.navigate('Test')} />
      <Button
        title='Go to About'
        onPress={() => navigation.navigate('About')}
      />
      <Button
        title='Go to ActionSheetScreen'
        onPress={() => navigation.navigate('ActionSheetScreen')}
      />
      <Button
        title='Go to Home'
        onPress={() => navigation.navigate('Kitchen')}
      />
      <Button title='Go back' onPress={() => navigation.goBack()} />
    </View>
  );
});

export default DetailsScreen;
