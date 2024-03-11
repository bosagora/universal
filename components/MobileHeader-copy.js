import React from 'react';
import { Heading, Text, VStack } from '@gluestack-ui/themed';

const MobileHeader = ({ title, subTitle }) => {
  return (
    <VStack px='$3' mt='$4.5' space='md'>
      <VStack space='xs' ml='$1' my='$4'>
        <Heading color='$textLight50' sx={{ _dark: { color: '$textDark50' } }}>
          {title}
        </Heading>
        <Text
          fontSize='$md'
          fontWeight='normal'
          color='$primary300'
          sx={{
            _dark: { color: '$textDark400' },
          }}>
          {subTitle}
        </Text>
      </VStack>
    </VStack>
  );
};

export default MobileHeader;
