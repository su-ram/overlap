export type Participant = {
  id: string;
  name: string;
};

export type TimeSlot = {
  dayIndex: number; // index in days array
  hourIndex: number; // index in hours array
  available: boolean;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  participants: Participant[];
};

export type AvailabilitySnapshot = {
  eventId: string;
  participantId: string;
  slots: TimeSlot[];
};




