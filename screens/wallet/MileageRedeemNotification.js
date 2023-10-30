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
import { NormalSteps } from 'dms-sdk-client';
import { getClient } from '../../utils/client';

const MileageRedeemNotification = observer(({ navigation }) => {
  const { loyaltyStore } = useStores();
  const [values, setValues] = useState(['T1', 'T2']);

  const [client, setClient] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    async function fetchClient() {
      console.log('MileageRedeemNotification > fetchClient');
      const { client, address } = await getClient();
      setClient(client);
      setAddress(address);

      const web3Status = await client.web3.isUp();
      console.log('web3Status :', web3Status);
      const isUp = await client.ledger.isRelayUp();
      console.log('isUp:', isUp);
    }
    fetchClient().then(() => console.log('end of fetchClient'));

    console.log('loyaltyStore :', loyaltyStore);
    // initiateTimer();
  }, []);

  async function confirmRedeem() {
    console.log(
      'confirm Redeem > loyaltyStore.payment :',
      loyaltyStore.payment,
    );
    if (loyaltyStore.payment.id.length < 0) {
      alert('Empty payment Id.');
      return;
    }
    const steps = [];
    const paymentId = loyaltyStore.payment.id;
    let detail = await client.ledger.getPaymentDetail(paymentId);

    console.log('payment detail : ', detail);
    // return;
    // Approve New
    for await (const step of client.ledger.approveNewPayment(
      paymentId,
      detail.purchaseId,
      detail.amount,
      detail.currency.toLowerCase(),
      detail.shopId,
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
      navigation.navigate('Wallet');
    }
  }

  return (
    <SafeAreaView>
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
        <MobileHeader
          title='마일리지 사용 알림'
          subTitle='마일리지로 상품 구매'
        />

        <VStack space='lg' pt='$4' m='$7'>
          <HStack>
            <Text w='40%'>구매 상점 :</Text>
            <Text>네모 김밥</Text>
          </HStack>
          <HStack>
            <Text w='40%'>구매 금액 :</Text>
            <Text>45800</Text>
          </HStack>
          <HStack>
            <Text w='40%'>사용 금액 :</Text>
            <Text>900</Text>
          </HStack>
          <HStack>
            <Text w='40%'>적립 금액 :</Text>
            <Text>460</Text>
          </HStack>
          <Box py='$10'>
            <Button py='$2.5' px='$3' onPress={() => confirmRedeem()}>
              <ButtonText>확인</ButtonText>
            </Button>
          </Box>
        </VStack>
      </Box>
    </SafeAreaView>
  );
});

export default MileageRedeemNotification;
