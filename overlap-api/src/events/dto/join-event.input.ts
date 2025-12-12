import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class JoinEventInput {
  @Field()
  eventId!: string;

  @Field({ description: 'Display name of the participant.' })
  name!: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Optional availability slot keys to seed when joining (e.g., 2024-08-05@10:00).',
  })
  availabilityKeys?: string[];
}
