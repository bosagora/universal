import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import {
  Box,
  Radio,
  RadioIcon,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  VStack,
} from '@gluestack-ui/themed';

import MobileHeader from '../../components/MobileHeader';
import { useTranslation } from 'react-i18next';
import { WrapBox } from '../../components/styled/layout';
import { WrapButton } from '../../components/styled/button';
import { ActiveButtonText } from '../../components/styled/text';
import {
  CheckCircleIcon,
  CircleDollarSignIcon,
  CircleIcon,
} from 'lucide-react-native';

const Network = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { secretStore, userStore } = useStores();
  const [network, setNetwork] = useState('mainnet');

  function moveNext() {
    secretStore.setNetwork(network);
    console.log('network :', network);
    navigation.navigate('Secret');
  }

  return (
    <WrapBox style={{ backgroundColor: userStore.contentColor }}>
      <MobileHeader
        title={t('network.header.title')}
        subTitle={t('network.header.subtitle')}
      />
      <VStack mt={50}>
        <RadioGroup value={network} onChange={setNetwork}>
          <VStack space='sm'>
            <Radio value='mainnet' aria-label='mainnet'>
              <RadioIndicator mr='$2' rounded='$xl'>
                <RadioIcon as={CircleIcon} fill='currentColor' />
              </RadioIndicator>
              <RadioLabel>Mainnet</RadioLabel>
            </Radio>
            <Radio value='testnet' aria-label='testnet'>
              <RadioIndicator mr='$2' rounded='$xl'>
                <RadioIcon as={CircleIcon} fill='currentColor' />
              </RadioIndicator>
              <RadioLabel>Testnet</RadioLabel>
            </Radio>
          </VStack>
        </RadioGroup>
        <Box pt={20}>
          <WrapButton onPress={moveNext}>
            <ActiveButtonText>{t('next')}</ActiveButtonText>
          </WrapButton>
        </Box>
      </VStack>
    </WrapBox>
  );
});

export default Network;
