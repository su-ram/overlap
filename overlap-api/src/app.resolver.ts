import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, { name: 'health', description: 'Simple health check for uptime monitoring.' })
  health(): string {
    return 'overlap-api is running';
  }
}
