import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '../../stores';
import {
  Box,
  Heading,
  VStack,
  Image,
  Text,
  HStack,
  View,
} from '@gluestack-ui/themed';
import { Link } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { getSecureValue } from '../../utils/secure.store';

const QRViewer = observer(({ navigation }) => {
  const { userStore } = useStores();
  const [walletAddress, SetWalletAddress] = useState('');
  useEffect(() => {
    async function fetchWalletAddress() {
      const address = await getSecureValue('address');
      SetWalletAddress(address);
    }
    fetchWalletAddress();
  }, []);
  return (
    <View
      h='$full'
      sx={{
        _dark: {
          bg: '$backgroundDark900',
          borderColor: '$borderDark800',
        },
      }}>
      <VStack w='$full' p={20}>
        <HStack justifyContent='center' alignItems='center' space='md'>
          <Box
            // maxWidth='$64'
            borderColor='$borderLight200'
            borderRadius='$lg'
            borderWidth='$1'
            my='$4'
            overflow='hidden'
            sx={{
              '@base': {
                mx: '$5',
              },
              _dark: {
                bg: '$backgroundDark700',
                borderColor: '$borderDark800',
              },
            }}>
            <Box w='$full' p={20}>
              {walletAddress ? (
                <QRCode size={250} value={walletAddress} />
              ) : null}
            </Box>
            <VStack px='$6' pt='$4' pb='$6'>
              <Text _dark={{ color: '$textLight200' }} fontSize='$sm' my='$1.5'>
                User Address : {walletAddress}
              </Text>
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </View>
  );
});

export default QRViewer;
