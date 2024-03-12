import { ActivityIndicator, Pressable, SafeAreaView, View } from 'react-native';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  EditIcon,
  HStack,
  VStack,
} from '@gluestack-ui/themed';
import { CheckCircleIcon, CheckIcon } from 'lucide-react-native';
import MobileHeader from '../../components/MobileHeader';
import { useTranslation } from 'react-i18next';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import { WrapButton } from '../../components/styled/button';
import {
  ActiveButtonText,
  Header2Text,
  Para2Text,
} from '../../components/styled/text';
import { MaterialIcons } from '@expo/vector-icons';

const Term = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { secretStore } = useStores();
  const [values, setValues] = useState([]);
  function agreeTerm() {
    if (values.includes('T1') && values.includes('T2')) {
      navigation.navigate('InitPinCodeScreen');
    }
  }
  function showTerm() {
    console.log('showTerm');
    secretStore.setShowTermSheet(true);
  }
  function showPrivacy() {
    console.log('showPrivacy');
    secretStore.setShowPrivacySheet(true);
  }
  return (
    <WrapBox>
      <Box flex={5}>
        <MobileHeader
          title={t('term.header.title', { appName: t('app.name') })}
          subTitle={t('term.header.subtitle')}
        />

        <VStack mt={50}>
          <CheckboxGroup
            value={values}
            aria-label='rating'
            onChange={(keys) => {
              setValues(keys);
              console.log('keys :', keys);
            }}>
            <VStack>
              <Header2Text>{t('term.body.heading')}</Header2Text>
              <WrapDivider></WrapDivider>
              <HStack justifyContent='space-between' mt={10}>
                <Checkbox value='T1' aria-label='rating1'>
                  <CheckboxIndicator mr='$2' rounded='$xl'>
                    <CheckboxIcon as={CheckCircleIcon} />
                  </CheckboxIndicator>
                  <Para2Text>{t('term.body.text.a')}</Para2Text>
                </Checkbox>
                <Pressable onPress={() => showTerm()}>
                  <MaterialIcons
                    name='arrow-forward-ios'
                    size={20}
                    color='black'
                  />
                </Pressable>
              </HStack>
              <HStack justifyContent='space-between' mt={10}>
                <Checkbox value='T2' aria-label='rating2'>
                  <CheckboxIndicator mr='$2' rounded='$xl'>
                    <CheckboxIcon as={CheckCircleIcon} />
                  </CheckboxIndicator>
                  <Para2Text>{t('term.body.text.b')}</Para2Text>
                </Checkbox>
                <Pressable onPress={() => showPrivacy()}>
                  <MaterialIcons
                    name='arrow-forward-ios'
                    size={20}
                    color='black'
                  />
                </Pressable>
              </HStack>
            </VStack>
          </CheckboxGroup>
        </VStack>
      </Box>
      <Box py={10}>
        <WrapButton onPress={() => agreeTerm()}>
          <ActiveButtonText>{t('button.press.d')}</ActiveButtonText>
        </WrapButton>
      </Box>
    </WrapBox>
  );
});

export default Term;
