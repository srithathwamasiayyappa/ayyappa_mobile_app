import React from 'react';
import { LegalScreen } from './LegalScreen';
import { SupportedLanguage } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

export const PrivacyPolicyScreen: React.FC<Props> = ({ currentLanguage = 'te', onBack }) => {
  return <LegalScreen currentLanguage={currentLanguage} initialTab="privacy" onBack={onBack} />;
};
