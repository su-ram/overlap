import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateAvailabilityInput {
  @Field()
  eventId!: string;

  @Field()
  participantId!: string;

  @Field(() => [String], { description: 'Availability slot keys the participant can attend.' })
  availabilityKeys!: string[];
}
