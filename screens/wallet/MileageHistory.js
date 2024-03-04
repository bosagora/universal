import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import { Box, FlatList, HStack, Text, VStack } from '@gluestack-ui/themed';
import MobileHeader from '../../components/MobileHeader';
import { getClient } from '../../utils/client';
import { convertProperValue, timePadding } from '../../utils/convert';
import { Amount, BOACoin, LedgerAction } from 'dms-sdk-client';
import { BigNumber } from '@ethersproject/bignumber';
import { useTranslation } from 'react-i18next';

const MileageHistory = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { secretStore, userStore } = useStores();
  const [client, setClient] = useState();
  const [address, setAddress] = useState('');
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
      const { client: client1, address: userAddress } = await getClient();
      console.log('>>>>>>> userAddress :', userAddress);
      setClient(client1);
      setAddress(userAddress);
      const resEst = await client1.ledger.getEstimatedSaveHistory(userAddress);
      console.log('resEst:', resEst);

      const scheduledHistory = resEst.map((it) => {
        return {
          id: it.timestamp + it.purchaseId,
          action: LedgerAction.SAVED,
          actionName: 'SCHEDULED',
          loyaltyType: it.loyaltyType,
          loyaltyTypeName: it.loyaltyType === 0 ? 'POINT' : 'TOKEN',
          amountPoint: it.providePoint.substring(0, it.providePoint.length - 9),
          amountToken: it.provideToken.substring(0, it.provideToken.length - 9),
          amountValue: it.provideValue,
          blockTimestamp: it.timestamp,
        };
      });
      console.log('scheduledHistory :', scheduledHistory);
      const res = await client1.ledger.getSaveAndUseHistory(userAddress, {
        limit: 100,
        skip: 0,
        sortDirection: 'desc',
        sortBy: 'blockNumber',
      });

      console.log('len :', res.userTradeHistories?.length);
      const tradeHistory = res.userTradeHistories
        .filter((it) => {
          return (
            it.action === LedgerAction.SAVED ||
            it.action === LedgerAction.USED ||
            it.action === LedgerAction.CHANGED
          );
        })
        .map((it) => {
          return {
            id: it.id,
            action: it.action,
            actionName:
              it.cancel === true
                ? 'CANCEL'
                : it.action === LedgerAction.SAVED
                ? 'SAVED'
                : it.action === LedgerAction.CHANGED
                ? 'CHANGED'
                : 'USED',
            loyaltyType: it.loyaltyType,
            loyaltyTypeName: it.loyaltyType === 0 ? 'POINT' : 'TOKEN',
            amountPoint: it.amountPoint,
            amountToken: it.amountToken,
            amountValue: it.amountValue,
            blockTimestamp: it.blockTimestamp,
          };
        });
      const history = scheduledHistory.concat(tradeHistory);
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
            m='$3'
            data={historyData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
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
                      {item.actionName === 'SCHEDULED'
                        ? t('user.wallet.history.body.text.e')
                        : item.actionName === 'CANCEL'
                        ? t('wallet.history.body.text.a')
                        : item.actionName === 'SAVED'
                        ? t('wallet.history.body.text.b')
                        : item.actionName === 'USED'
                        ? t('wallet.history.body.text.c')
                        : t('user.wallet.history.body.text.d')}
                    </Text>
                    <Text
                      fontSize='$sm'
                      color='$coolGray600'
                      sx={{
                        _dark: {
                          color: '$warmGray200',
                        },
                      }}>
                      {timeConverter(item.blockTimestamp)}
                    </Text>
                  </VStack>
                  <Box>
                    <Text>
                      {item.actionName === 'CANCEL' ||
                      item.actionName === 'SAVED' ||
                      item.actionName === 'SCHEDULED'
                        ? '+'
                        : item.actionName === 'USED'
                        ? '-'
                        : ''}
                      {convertProperValue(
                        item.loyaltyType === 1
                          ? new Amount(
                              BigNumber.from(item.amountToken),
                              9,
                            ).toBOAString()
                          : new Amount(
                              BigNumber.from(item.amountPoint),
                              9,
                            ).toBOAString(),
                        item.loyaltyType,
                      )}{' '}
                      {item.loyaltyTypeName}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            )}
          />
        ) : null}
      </Box>
    </SafeAreaView>
  );
});

export default MileageHistory;
