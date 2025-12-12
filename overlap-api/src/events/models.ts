import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Participant {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => [String], {
    description: 'Availability slot keys (e.g., 2024-08-05@10:00) this participant marked as possible.',
  })
  availabilityKeys!: string[];
}

@ObjectType()
export class AvailabilitySlot {
  @Field({ description: 'Label for the day (e.g., THU, FRI)' })
  dayLabel!: string;

  @Field({ description: 'Date label used in the UI (e.g., 8/5)' })
  date!: string;

  @Field({ description: 'Time label such as 10:00' })
  hour!: string;

  @Field(() => Int, { description: 'Number of participants who are available for this slot (0-4 scale).' })
  availability!: number;
}

@ObjectType()
export class TopTimeSlot {
  @Field({ description: 'Composite key built from date and hour (e.g., 2024-08-05@10:00)' })
  slotKey!: string;

  @Field({ description: 'Formatted label shown in UI lists' })
  label!: string;

  @Field(() => Int)
  votes!: number;
}

@ObjectType()
export class Event {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  location!: string;

  @Field(() => Int)
  maxParticipants!: number;

  @Field(() => [Participant])
  participants!: Participant[];

  @Field(() => [AvailabilitySlot], { description: 'Condensed availability grid used by /timetable and event detail views.' })
  timetable!: AvailabilitySlot[];

  @Field(() => [TopTimeSlot], { description: 'Precomputed best time slots ordered by votes desc.' })
  topSlots!: TopTimeSlot[];

  @Field()
  createdAt!: Date;
}
