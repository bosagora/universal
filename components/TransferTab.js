import React from 'react';
import { SearchIcon } from '@gluestack-ui/themed';
import { HStack, Icon, Pressable, Text } from '@gluestack-ui/themed';

const TransferTab = ({ userStore }) => {
  const [selectedTab, setSelectedTab] = React.useState(
    userStore.isMainChainTransfer ? 'BosAgora' : 'Ledger',
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
          bg={selectedTab === 'BosAgora' ? '#5C66D5' : 'transparent'}
          sx={{
            _dark: {
              bg: selectedTab === 'BosAgora' ? '#5C66D5' : 'transparent',
            },
          }}
          onPress={() => {
            setSelectedTab('BosAgora');
            userStore.setIsMainChainTransfer(true);
          }}
          px='$3'
          py='$1.5'>
          <Text
            size='sm'
            fontWeight='$medium'
            color={selectedTab === 'BosAgora' ? 'white' : '#555555'}>
            BosAgora
          </Text>
        </Pressable>
        {/*<Pressable*/}
        {/*  rounded='$full'*/}
        {/*  px='$3'*/}
        {/*  py='$1.5'*/}
        {/*  bg={selectedTab === 'Ledger' ? '#5C66D5' : 'transparent'}*/}
        {/*  sx={{*/}
        {/*    _dark: {*/}
        {/*      bg: selectedTab === 'Ledger' ? '#5C66D5' : 'transparent',*/}
        {/*    },*/}
        {/*  }}*/}
        {/*  onPress={() => {*/}
        {/*    setSelectedTab('Ledger');*/}
        {/*    userStore.setIsMainChainTransfer(false);*/}
        {/*  }}>*/}
        {/*  <Text*/}
        {/*    size='sm'*/}
        {/*    fontWeight='$medium'*/}
        {/*    color={selectedTab === 'Ledger' ? 'white' : '#555555'}>*/}
        {/*    Ledger*/}
        {/*  </Text>*/}
        {/*</Pressable>*/}
      </HStack>
    </HStack>
  );
};
export default TransferTab;
