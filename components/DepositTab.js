import React from 'react';
import { HStack, Pressable, Text } from '@gluestack-ui/themed';

const DepositTabs = ({ userStore }) => {
  const [selectedTab, setSelectedTab] = React.useState(
    userStore.isDeposit ? 'Deposit' : 'Withdraw',
  );
  return (
    <HStack h='$20' alignItems='center' justifyContent='center'>
      <HStack
        rounded='$full'
        p='$1.5'
        alignItems='center'
        borderWidth={1}
        borderColor='$borderLight200'
        sx={{ _dark: { borderColor: '$borderDark900' } }}>
        <Pressable
          rounded='$full'
          bg={selectedTab === 'Deposit' ? '#5C66D5' : 'transparent'}
          sx={{
            _dark: {
              bg: selectedTab === 'Deposit' ? '#5C66D5' : 'transparent',
            },
          }}
          onPress={() => {
            setSelectedTab('Deposit');
            userStore.setIsDeposit(true);
          }}
          px='$3'
          py='$1.5'>
          <Text
            size='sm'
            fontWeight='$medium'
            color={selectedTab === 'Deposit' ? 'white' : '#555555'}>
            Deposit
          </Text>
        </Pressable>
        <Pressable
          rounded='$full'
          px='$3'
          py='$1.5'
          bg={selectedTab === 'Withdraw' ? '#5C66D5' : 'transparent'}
          sx={{
            _dark: {
              bg: selectedTab === 'Withdraw' ? '#5C66D5' : 'transparent',
            },
          }}
          onPress={() => {
            setSelectedTab('Withdraw');
            userStore.setIsDeposit(false);
          }}>
          <Text
            size='sm'
            fontWeight='$medium'
            color={selectedTab === 'Withdraw' ? 'white' : '#555555'}>
            Withdraw
          </Text>
        </Pressable>
      </HStack>
    </HStack>
  );
};
export default DepositTabs;
