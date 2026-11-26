import React from 'react';
import { LegalScreen } from './LegalScreen';
import { SupportedLanguage } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

export const RefundPolicyScreen: React.FC<Props> = ({ currentLanguage = 'te', onBack }) => {
  return <LegalScreen currentLanguage={currentLanguage} initialTab="refund" onBack={onBack} />;
};
