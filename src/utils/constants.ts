import tr  from './translate';

export const SKILLS = {
  command_skill: 'Command',
  diplomacy_skill: 'Diplomacy',
  engineering_skill: 'Engineering',
  medicine_skill: 'Medicine',
  science_skill: 'Science',
  security_skill: 'Security'
};

export const skillAbbrieviations = {
  command_skill: 'CMD',
  diplomacy_skill: 'DIP',
  engineering_skill: 'ENG',
  medicine_skill: 'MED',
  science_skill: 'SCI',
  security_skill: 'SEC'
};

export enum VoyageState {
  started = 'started',
  failed = 'failed',
  recalled = 'recalled',
  completed = 'completed'
};

export const voyageSeats = [
  {
    symbol: 'captain_slot',
    title: tr`First Officer`
  },
  {
    symbol: 'first_officer',
    title: tr`Helm Officer`
  },
  {
    symbol: 'chief_communications_officer',
    title: tr`Communications Officer`
  },
  {
    symbol: 'communications_officer',
    title: tr`Diplomat`
  },
  {
    symbol: 'chief_engineering_officer',
    title: tr`Chief Engineer`
  },
  {
    symbol: 'engineering_officer',
    title: tr`Engineer`
  },
  {
    symbol: 'chief_medical_officer',
    title: tr`Chief Medical Officer`
  },
  {
    symbol: 'medical_officer',
    title: tr`Ship's Counselor`
  },
  {
    symbol: 'chief_science_officer',
    title: tr`Chief Science Officer`
  },
  {
    symbol: 'science_officer',
    title: tr`Deputy Science Officer`
  },
  {
    symbol: 'chief_security_officer',
    title: tr`Chief Security Officer`
  },
  {
    symbol: 'security_officer',
    title: tr`Tactical Officer`
  }
];

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'kl', name: 'Klingon' }
];
