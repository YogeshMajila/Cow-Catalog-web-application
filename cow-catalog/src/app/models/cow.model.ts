export type CowSex = 'Male' | 'Female';
export type CowStatus = 'Active' | 'In Treatment' | 'Deceased';

export interface CowEvent {
  id: string;
  date: string;          // ISO date string
  type: 'Weight Check' | 'Treatment' | 'Pen Move' | 'Death';
  description: string;
}

export interface Cow {
  earTag: string;
  sex: CowSex;
  pen: string;
  status: CowStatus;
  weight?: number;
  dailyWeightGain?: number;
  events: CowEvent[];
  createdAt: string;     // ISO date string
}
