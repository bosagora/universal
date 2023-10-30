import React from 'react';
import {
  AddIcon,
  Box,
  Button,
  ButtonIcon,
  VStack,
  Heading,
  Text,
} from '@gluestack-ui/themed';
import * as Notifications from 'expo-notifications';
import { useStores } from '../../stores';

export default function LocalNotification({ navigation }) {
  const { secretStore } = useStores();
  function sendPushNotification() {
    fetch('http://192.168.50.83:8333/api/notification/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: secretStore.address,
      }),
    }).then((res) => {
      console.log('send push :', JSON.stringify(res));
    });
  }

  return (
    <Box flex={1} justifyContent='center' bg='$primary950'>
      <VStack space='xl' reversed={false}>
        <Box alignItems='center'>
          <Heading mb='$4' color='white'>
            Push Notifications
          </Heading>
          <Button
            size='md'
            variant='solid'
            action='primary'
            isDisabled={false}
            isFocusVisible={false}
            onPress={async () => await sendPushNotification()}>
            <Text color='white'>Send</Text>
            <ButtonIcon as={AddIcon} />
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}
