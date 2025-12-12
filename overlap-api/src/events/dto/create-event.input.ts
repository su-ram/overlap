import { Field, InputType, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@InputType()
export class CreateEventInput {
  @Field()
  title!: string;

  @Field()
  location!: string;

  @Field(() => Int, { description: 'Maximum participants allowed (1-10 for now).' })
  @Min(1)
  @Max(50)
  maxParticipants!: number;
}
