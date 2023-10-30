import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Box,
  Heading,
  FlatList,
  HStack,
  VStack,
  Text,
  Switch,
} from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useStores } from '../../stores';
import { PinCodeT } from 'react-native-pincode-bosagora-ys';
import { Pressable } from 'react-native';

const Configuration = observer(({ navigation }) => {
  const { pinStore, userStore } = useStores();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(userStore.enableBio);
    pinStore.setMode(PinCodeT.Modes.Enter);
    pinStore.setSuccessEnter(false);
    pinStore.setVisible(false);
  }, []);
  const toggleSwitch = (toggleState) => {
    console.log('bio :', toggleState);
    setIsEnabled(toggleState);
    userStore.setEnableBio(toggleState);
  };
  const setPincode = () => {
    console.log('setPincode');
    pinStore.setNextScreen('setPincode');
    pinStore.setSuccessEnter(false);
    pinStore.setVisible(true);
    pinStore.setUseFooter(true);
  };

  const goWalletManager = () => {
    pinStore.setNextScreen('WalletManager');
    pinStore.setSuccessEnter(false);
    pinStore.setVisible(true);
    pinStore.setUseFooter(true);
  };

  const goProperScreen = (id) => {
    console.log('item.name :', id);
    if (id === 'bd7acbea') {
      setPincode();
    } else if (id === '58694a0f') {
      goWalletManager();
    } else if (id === '3ac68afc') {
      console.log('bio ');
    }
  };

  const data = [
    {
      id: 'bd7acbea',
      name: 'PIN 번호 변경',
    },
    {
      id: '3ac68afc',
      name: '바이오 인증 사용',
    },
    {
      id: '58694a0f',
      name: '월렛 설정',
    },
  ];
  return (
    <Box
      sx={{
        _dark: { bg: '$backgroundDark800' },
        _web: {
          height: '100vh',
          w: '100vw',
          overflow: 'hidden',
        },
      }}
      height='$full'
      bg='$backgroundLight0'>
      <Heading size='xl' p='$4' pb='$3'>
        설정
      </Heading>
      <FlatList
        m='$3'
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => goProperScreen(item.id)}>
            <Box
              borderBottomWidth='$1'
              borderColor='$trueGray800'
              sx={{
                _dark: {
                  borderColor: '$trueGray100',
                },
                '@base': {
                  pl: 0,
                  pr: 0,
                },
                '@sm': {
                  pl: '$4',
                  pr: '$5',
                },
              }}
              py='$2'>
              <HStack
                space='md'
                alignItems='center'
                justifyContent='space-between'>
                <VStack>
                  <Text
                    fontSize='$sm'
                    color='$coolGray600'
                    sx={{
                      _dark: {
                        color: '$warmGray200',
                      },
                    }}>
                    {item.name}
                  </Text>
                </VStack>
                <Box>
                  {item.id !== '3ac68afc' ? (
                    <MaterialIcons
                      name='arrow-forward-ios'
                      size={20}
                      color='white'
                    />
                  ) : (
                    <Switch
                      size='sm'
                      onToggle={toggleSwitch}
                      value={isEnabled}
                    />
                  )}
                </Box>
              </HStack>
            </Box>
          </Pressable>
        )}
      />
    </Box>
  );
});

export default Configuration;
