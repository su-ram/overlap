import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventService } from './event.service';
import { Event } from './models';
import { CreateEventInput } from './dto/create-event.input';
import { JoinEventInput } from './dto/join-event.input';
import { UpdateAvailabilityInput } from './dto/update-availability.input';

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Query(() => [Event], { description: 'List events (aligns with /moim list routes).' })
  events(): Event[] {
    return this.eventService.findAll();
  }

  @Query(() => Event, { description: 'Fetch a single event by id (used by /moim/[id]).' })
  event(@Args('id') id: string): Event {
    return this.eventService.findOne(id);
  }

  @Mutation(() => Event, { description: 'Create a new event for /new flow. Returns generated id.' })
  createEvent(@Args('input') input: CreateEventInput): Event {
    return this.eventService.create(input);
  }

  @Mutation(() => Event, { description: 'Join an event and optionally seed availability (used by /moim/[id]/join).' })
  joinEvent(@Args('input') input: JoinEventInput): Event {
    return this.eventService.join(input);
  }

  @Mutation(() => Event, { description: 'Update a participant availability grid (used by /timetable in future DB-backed flow).' })
  updateAvailability(@Args('input') input: UpdateAvailabilityInput): Event {
    return this.eventService.updateAvailability(input);
  }
}
