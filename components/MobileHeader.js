import React from 'react';
import { Heading, Text, VStack } from '@gluestack-ui/themed';
import { HeaderText, SubHeaderText } from './styled/text';

const MobileHeader = ({ title, subTitle }) => {
  return (
    <>
      <HeaderText>{title}</HeaderText>
      <SubHeaderText mt={7}>{subTitle}</SubHeaderText>
    </>
  );
};

export default MobileHeader;
