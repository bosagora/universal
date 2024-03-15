import { SafeAreaView } from 'react-native';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  HStack,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { CheckIcon } from 'lucide-react-native';
import MobileHeader from '../../components/MobileHeader';
import '@ethersproject/shims';
import { Amount, LoyaltyType, NormalSteps } from 'dms-sdk-client';
import { getClient } from '../../utils/client';
import {
  checkValidPeriod,
  convertProperValue,
  isEmpty,
} from '../../utils/convert';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import {
  WrapBase2,
  WrapBox,
  WrapDivider,
} from '../../components/styled/layout';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  RobotoMediumText,
  RobotoSemiBoldText,
} from '../../components/styled/text';
import { WrapButton, WrapWhiteButton } from '../../components/styled/button';

const MileageRedeemNotification = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { pinStore, loyaltyStore, userStore } = useStores();
  const [values, setValues] = useState(['T1', 'T2']);

  const [client, setClient] = useState(null);
  const [address, setAddress] = useState('');

  const [shopName, setShopName] = useState('');
  const [shopId, setShopId] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [amount, setAmount] = useState(new Amount(0, 18));
  const [useAmount, setUseAmount] = useState(new Amount(0, 18));
  const [loyaltyType, setLoyaltyType] = useState(0);
  const [currency, setCurrency] = useState('');
  const [hasPayment, setHasPayment] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function fetchClient() {
      try {
        const { client: client1, address } = await getClient();
        setClient(client1);
        setAddress(address);

        if (
          loyaltyStore.payment &&
          !isEmpty(loyaltyStore.payment) &&
          loyaltyStore.payment.type === 'new'
        ) {
          if (
            checkValidPeriod(
              loyaltyStore.payment.timestamp,
              loyaltyStore.payment.timeout,
            )
          ) {
            setExpired(false);
          } else {
            setExpired(true);
            alert(t('wallet.expired.alert'));
          }
          setHasPayment(true);
          await savePaymentInfo(client1, loyaltyStore.payment.id);
        } else {
          setHasPayment(false);
        }
      } catch (e) {
        // alert('shop notificaiton error :' + JSON.stringify(e));
      }
    }
    fetchClient().then(() => console.log('end of fetchClient'));

    console.log('loyaltyStore :', loyaltyStore);
  }, [loyaltyStore.payment]);
  const saveShopInfo = async (cc, shopId) => {
    // get shop info
    const info = await cc.shop.getShopInfo(shopId);
    console.log('shop info : ', info);
    setShopId(shopId);
    setShopName(info.name);
  };

  const savePaymentInfo = async (cc, paymentId) => {
    const info = await cc.ledger.getPaymentDetail(paymentId);
    console.log('payment info:', info);
    await Clipboard.setStringAsync(JSON.stringify(info));
    setPurchaseId(info.purchaseId);
    setAmount(new Amount(info.amount, 18));
    setCurrency(info.currency);
    const mm = info.loyaltyType === 0 ? info.paidPoint : info.paidToken;
    setUseAmount(new Amount(mm, 18));
    setLoyaltyType(info.loyaltyType);
    await saveShopInfo(cc, info.shopId);
  };

  async function confirmRedeem() {
    try {
      const steps = [];

      // return;

      for await (const step of client.ledger.approveNewPayment(
        loyaltyStore.payment.id,
        purchaseId,
        amount.value,
        currency.toLowerCase(),
        shopId,
        true,
      )) {
        steps.push(step);
        console.log('confirmRedeem step :', step);
        switch (step.key) {
          case NormalSteps.PREPARED:
            break;
          case NormalSteps.SENT:
            break;
          case NormalSteps.APPROVED:
            break;
          default:
            throw new Error(
              'Unexpected pay point step: ' + JSON.stringify(step, null, 2),
            );
        }
      }
      if (steps.length === 3 && steps[2].key === 'approved') {
        const time = Math.round(+new Date() / 1000);
        loyaltyStore.setLastUpdateTime(time);
        loyaltyStore.setPayment({});
        pinStore.setNextScreen('Wallet');
        alert(t('wallet.redeem.use.done'));
      }
    } catch (e) {
      console.log('e :', e);
      loyaltyStore.setPayment({});
      pinStore.setNextScreen('Wallet');
      alert(t('wallet.redeem.use.fail') + 'e:' + e.message);
    }
  }

  async function cancelCancel() {
    loyaltyStore.setPayment({});
    pinStore.setNextScreen('Wallet');
  }

  return hasPayment ? (
    <WrapBase2
      style={{ paddingTop: 35, backgroundColor: userStore.contentColor }}
      height='$full'>
      <MobileHeader
        title={t('wallet.redeem.header.title')}
        subTitle={t('wallet.redeem.header.subtitle')}
      />

      <VStack pt={50}>
        <WrapDivider mb={12}></WrapDivider>
        <HStack my={10} alignItems='center' justifyContent='space-between'>
          <RobotoMediumText
            fontSize={15}
            fontWeight={500}
            lightHeight={16}
            color='#707070'>
            {t('shop')} :
          </RobotoMediumText>
          <RobotoSemiBoldText>
            {shopName}
            Shop New 9
          </RobotoSemiBoldText>
        </HStack>
        <WrapDivider mb={12}></WrapDivider>
        <HStack my={10} alignItems='center' justifyContent='space-between'>
          <RobotoMediumText
            fontSize={15}
            fontWeight={500}
            lightHeight={16}
            color='#707070'>
            {t('purchase')} ID :
          </RobotoMediumText>
          <RobotoSemiBoldText>
            {purchaseId}
            892938789
          </RobotoSemiBoldText>
        </HStack>
        <WrapDivider mb={12}></WrapDivider>
        <HStack my={10} alignItems='center' justifyContent='space-between'>
          <RobotoMediumText
            fontSize={15}
            fontWeight={500}
            lightHeight={16}
            color='#707070'>
            {t('purchase')} {t('amount')} :
          </RobotoMediumText>
          <RobotoSemiBoldText>
            {convertProperValue(amount.toBOAString())} {currency.toUpperCase()}
          </RobotoSemiBoldText>
        </HStack>
        <WrapDivider mb={12}></WrapDivider>
        <HStack my={10} alignItems='center' justifyContent='space-between'>
          <RobotoMediumText
            fontSize={15}
            fontWeight={500}
            lightHeight={16}
            color='#707070'>
            {t('wallet.redeem.header.body.a')} :
          </RobotoMediumText>
          <RobotoSemiBoldText>
            {convertProperValue(useAmount.toBOAString())}{' '}
            {loyaltyType === LoyaltyType.POINT ? 'POINT' : 'TOKEN'}
          </RobotoSemiBoldText>
        </HStack>
        <WrapDivider></WrapDivider>

        <HStack pt={20} flex={1}>
          <Box flex={1} mr={5}>
            <WrapWhiteButton onPress={() => cancelCancel()}>
              <ActiveWhiteButtonText>
                {t('button.press.b')}
              </ActiveWhiteButtonText>
            </WrapWhiteButton>
          </Box>
          <Box flex={1} ml={5}>
            <WrapButton onPress={() => confirmRedeem()}>
              <ActiveButtonText>{t('button.press.a')}</ActiveButtonText>
            </WrapButton>
          </Box>
        </HStack>
      </VStack>
    </WrapBase2>
  ) : null;
});

export default MileageRedeemNotification;
