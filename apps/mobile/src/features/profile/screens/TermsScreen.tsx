import React from 'react';
import { LegalScreen } from './LegalScreen';
import { SupportedLanguage } from '../../../types';

interface Props {
  currentLanguage: SupportedLanguage;
  onBack: () => void;
}

export const TermsScreen: React.FC<Props> = ({ currentLanguage = 'te', onBack }) => {
  return <LegalScreen currentLanguage={currentLanguage} initialTab="terms" onBack={onBack} />;
};
