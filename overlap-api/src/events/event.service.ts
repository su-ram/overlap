import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AvailabilitySlot, Event, Participant, TopTimeSlot } from './models';
import { CreateEventInput } from './dto/create-event.input';
import { JoinEventInput } from './dto/join-event.input';
import { UpdateAvailabilityInput } from './dto/update-availability.input';

const seedDayLabels = ['THU', 'FRI', 'SAT', 'SUN'];
const seedDates = ['8/5', '8/6', '8/7', '8/8'];
const seedHours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

interface ParticipantRecord {
  id: string;
  name: string;
  availabilityKeys: Set<string>;
}

interface EventRecord {
  id: string;
  title: string;
  location: string;
  maxParticipants: number;
  participants: ParticipantRecord[];
  slotMap: Map<string, Set<string>>;
  createdAt: Date;
}

@Injectable()
export class EventService {
  private events: Map<string, EventRecord> = new Map();

  constructor() {
    this.seedSampleEvent();
  }

  findAll(): Event[] {
    return Array.from(this.events.values()).map((record) => this.toGraphQL(record));
  }

  findOne(id: string): Event {
    const record = this.events.get(id);
    if (!record) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return this.toGraphQL(record);
  }

  create(input: CreateEventInput): Event {
    const id = randomUUID();
    const record: EventRecord = {
      id,
      title: input.title,
      location: input.location,
      maxParticipants: input.maxParticipants,
      participants: [],
      slotMap: new Map(),
      createdAt: new Date(),
    };

    this.events.set(id, record);
    return this.toGraphQL(record);
  }

  join(input: JoinEventInput): Event {
    const record = this.events.get(input.eventId);
    if (!record) {
      throw new NotFoundException(`Event ${input.eventId} not found`);
    }

    if (record.participants.length >= record.maxParticipants) {
      throw new BadRequestException('Event has reached the participant limit');
    }

    const participant: ParticipantRecord = {
      id: randomUUID(),
      name: input.name,
      availabilityKeys: new Set(input.availabilityKeys ?? []),
    };

    record.participants.push(participant);
    this.applyAvailability(record, participant.id, participant.availabilityKeys);

    return this.toGraphQL(record);
  }

  updateAvailability(input: UpdateAvailabilityInput): Event {
    const record = this.events.get(input.eventId);
    if (!record) {
      throw new NotFoundException(`Event ${input.eventId} not found`);
    }

    const participant = record.participants.find((p) => p.id === input.participantId);
    if (!participant) {
      throw new NotFoundException(`Participant ${input.participantId} not found in event ${input.eventId}`);
    }

    participant.availabilityKeys = new Set(input.availabilityKeys);
    this.applyAvailability(record, participant.id, participant.availabilityKeys);

    return this.toGraphQL(record);
  }

  private seedSampleEvent() {
    const sampleEvent: EventRecord = {
      id: 'sample-moim-1',
      title: '팀 회식 일정 조율',
      location: '서울 합정',
      maxParticipants: 10,
      participants: [],
      slotMap: new Map(),
      createdAt: new Date(),
    };

    const sampleParticipants: Array<{ name: string; keys: string[] }> = [
      {
        name: '김수람',
        keys: ['2024-08-05@10:00', '2024-08-05@11:00', '2024-08-06@15:00', '2024-08-07@14:00'],
      },
      {
        name: '김석현',
        keys: ['2024-08-05@11:00', '2024-08-06@15:00', '2024-08-07@14:00', '2024-08-07@16:00'],
      },
      {
        name: '오현준',
        keys: ['2024-08-05@10:00', '2024-08-06@15:00', '2024-08-07@16:00'],
      },
    ];

    sampleParticipants.forEach(({ name, keys }) => {
      const participant: ParticipantRecord = {
        id: randomUUID(),
        name,
        availabilityKeys: new Set(keys),
      };

      sampleEvent.participants.push(participant);
      this.applyAvailability(sampleEvent, participant.id, participant.availabilityKeys);
    });

    this.events.set(sampleEvent.id, sampleEvent);
  }

  private applyAvailability(record: EventRecord, participantId: string, keys: Set<string>) {
    // First remove participant from any slot they no longer occupy
    record.slotMap.forEach((set) => set.delete(participantId));

    keys.forEach((key) => {
      if (!record.slotMap.has(key)) {
        record.slotMap.set(key, new Set([participantId]));
      } else {
        record.slotMap.get(key)!.add(participantId);
      }
    });
  }

  private toGraphQL(record: EventRecord): Event {
    const participants: Participant[] = record.participants.map((p) => ({
      id: p.id,
      name: p.name,
      availabilityKeys: Array.from(p.availabilityKeys),
    }));

    const timetable: AvailabilitySlot[] = [];

    seedDayLabels.forEach((dayLabel, dayIndex) => {
      const date = seedDates[dayIndex];
      seedHours.forEach((hour) => {
        const slotKey = `2024-08-0${5 + dayIndex}@${hour}`;
        const participantsForSlot = record.slotMap.get(slotKey);
        timetable.push({
          dayLabel,
          date,
          hour,
          availability: participantsForSlot ? Math.min(participantsForSlot.size, 4) : 0,
        });
      });
    });

    const topSlots: TopTimeSlot[] = timetable
      .map((slot) => ({
        slotKey: `2024-08-${slot.date.split('/')[1].padStart(2, '0')}@${slot.hour}`,
        label: `${slot.date} ${slot.hour}`,
        votes: slot.availability,
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);

    return {
      id: record.id,
      title: record.title,
      location: record.location,
      maxParticipants: record.maxParticipants,
      participants,
      timetable,
      topSlots,
      createdAt: record.createdAt,
    };
  }
}
