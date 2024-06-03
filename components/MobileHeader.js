import React from 'react';
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
