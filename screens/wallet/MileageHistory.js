import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import { Box, FlatList, HStack, Text, VStack } from '@gluestack-ui/themed';
import MobileHeader from '../../components/MobileHeader';
import { convertProperValue, timePadding } from '../../utils/convert';
import { Amount, BOACoin, LedgerAction } from 'dms-sdk-client-v2';
import { BigNumber } from '@ethersproject/bignumber';
import { useTranslation } from 'react-i18next';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import { NumberText, Para3Text, ParaText } from '../../components/styled/text';

const MileageHistory = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { secretStore, userStore } = useStores();
  const [historyData, setHistoryData] = useState([]);
  function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time =
      year +
      '/' +
      month +
      '/' +
      timePadding(date) +
      ' ' +
      timePadding(hour) +
      ':' +
      timePadding(min) +
      ':' +
      timePadding(sec);
    return time;
  }
  console.log(timeConverter(0));
  useEffect(() => {
    const fetchHistory = async () => {
      const resEst = await secretStore.client.ledger.getEstimatedSaveHistory(
        secretStore.address,
      );
      console.log('resEst:', resEst);

      const scheduledHistory = resEst.map((it) => {
        return {
          id: it.blockTimestamp + it.purchaseId,
          action: LedgerAction.SAVED,
          actionName: 'SCHEDULED',

          amountPoint: it.providePoint.substring(0, it.providePoint.length - 9),
          amountToken: it.provideToken.substring(0, it.provideToken.length - 9),
          amountValue: it.provideValue,
          blockTimestamp: it.timestamp,
        };
      });
      console.log('scheduledHistory :', scheduledHistory);
      const res = await secretStore.client.ledger.getSaveAndUseHistory(
        secretStore.address,
        1,
        100,
      );

      console.log('len :', res.items?.length);
      console.log('res :', res);
      const tradeHistory = res.items
        .filter((it) => {
          return (
            it.action === LedgerAction.SAVED ||
            it.action === LedgerAction.USED ||
            it.action === LedgerAction.CHANGED
          );
        })
        .map((it) => {
          return {
            id: it.blockTimestamp + it.purchaseId,
            action: it.action,
            actionName:
              it.cancel === true
                ? 'CANCEL'
                : it.action === LedgerAction.SAVED
                ? 'SAVED'
                : it.action === LedgerAction.CHANGED
                ? 'CHANGED'
                : 'USED',

            amountPoint: it.amountPoint,
            amountToken: it.amountToken,
            amountValue: it.amountValue,
            blockTimestamp: it.blockTimestamp,
          };
        });
      const history = scheduledHistory.concat(tradeHistory);
      // const history = [
      //   {
      //     action: 1,
      //     actionName: 'SAVED',
      //     amountPoint: '10000000000000',
      //     blockTimestamp: '1710296615',
      //     currency: 'krw',
      //     id: '0x3312188d36afff93ee6b6784c1372be0bd37db34f94069b1f917e97904193b4901000000',
      //     increase: '2500000000000',
      //     loyaltyTypeName: 'POINT',
      //   },
      //   {
      //     action: 1,
      //     actionName: 'SAVED',
      //     amountPoint: '7500000000000',
      //     blockTimestamp: '1710296579',
      //     currency: 'krw',
      //     id: '0x4a0ac844d4f16bfbaa4fa0b01cf17bfa24581496f69c756ae2887ba9a51de19201000000',
      //     increase: '7500000000000',
      //     loyaltyTypeName: 'POINT',
      //   },
      // ];
      history.sort(function (a, b) {
        // 오름차순
        return a.blockTimestamp > b.blockTimestamp
          ? -1
          : a.blockTimestamp < b.blockTimestamp
          ? 1
          : 0;
      });

      console.log('history :', history.slice(0, 3));
      setHistoryData(history);
    };
    fetchHistory()
      .then()
      .catch((e) => console.log('history error :', e));
  }, []);

  return (
    <WrapBox
      style={{ paddingTop: 35, backgroundColor: userStore.contentColor }}>
      <MobileHeader
        title={t('wallet.history.header.title')}
        subTitle={
          historyData && historyData.length > 0
            ? t('wallet.history.header.subtitle.a') +
              ' ' +
              historyData.length +
              ' ' +
              t('wallet.history.header.subtitle.b')
            : t('wallet.history.header.subtitle.nothing')
        }
      />
      {historyData && historyData.length > 0 ? (
        <FlatList
          mt={40}
          data={historyData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Box>
              <VStack>
                <HStack
                  space='md'
                  alignItems='center'
                  justifyContent='space-between'>
                  <VStack>
                    <ParaText fontSize={14} fontWeight={400} lightHeight={20}>
                      {item.actionName === 'SCHEDULED'
                        ? t('user.wallet.history.body.text.e')
                        : item.actionName === 'CANCEL'
                        ? t('wallet.history.body.text.a')
                        : item.actionName === 'SAVED'
                        ? t('wallet.history.body.text.b')
                        : item.actionName === 'USED'
                        ? t('wallet.history.body.text.c')
                        : t('user.wallet.history.body.text.d')}
                    </ParaText>
                    <ParaText
                      fontSize={15}
                      fontWeight={500}
                      lightHeight={16}
                      color='#707070'>
                      {timeConverter(item.blockTimestamp)}
                    </ParaText>
                  </VStack>
                  <HStack alignItems='center' justifyContent='flex-end'>
                    <NumberText>
                      {item.actionName === 'CANCEL' ||
                      item.actionName === 'SAVED' ||
                      item.actionName === 'SCHEDULED'
                        ? '+'
                        : item.actionName === 'USED'
                        ? '-'
                        : ''}
                      {convertProperValue(
                        new Amount(
                          BigNumber.from(item.amountPoint),
                          18,
                        ).toBOAString(),
                        0,
                      )}{' '}
                    </NumberText>
                    <Para3Text
                      pt={4}
                      color='#12121D'
                      style={{ fontWeight: 400 }}>
                      Point(s)
                    </Para3Text>
                  </HStack>
                </HStack>
                <WrapDivider mb={3}></WrapDivider>
              </VStack>
            </Box>
          )}
        />
      ) : null}
    </WrapBox>
  );
});

export default MileageHistory;
