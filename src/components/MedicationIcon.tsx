import React from 'react';
import {
  Pill,
  FlaskConical,
  Syringe,
  Sparkles,
  Droplets,
  Wind,
  ShieldPlus,
  Square,
  Activity,
  CircleDot,
} from 'lucide-react';
import { MedicationForm } from '../types';

interface MedicationIconProps {
  form: MedicationForm;
  className?: string;
}

export const MedicationIcon: React.FC<MedicationIconProps> = ({ form, className = 'w-5 h-5' }) => {
  switch (form) {
    case 'tablet':
      return <Pill className={className} />;
    case 'capsule':
      return <Pill className={`${className} rotate-45`} />;
    case 'syrup':
      return <FlaskConical className={className} />;
    case 'injection':
      return <Syringe className={className} />;
    case 'ointment':
      return <Sparkles className={className} />;
    case 'drops':
      return <Droplets className={className} />;
    case 'inhaler':
      return <Wind className={className} />;
    case 'suppository':
      return <ShieldPlus className={className} />;
    case 'patch':
      return <Square className={className} />;
    case 'effervescent':
      return <Activity className={className} />;
    case 'other':
    default:
      return <CircleDot className={className} />;
  }
};
