import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, { description: 'Simple health check for the API' })
  hello(): string {
    return 'Hello from overlap-api GraphQL server';
  }
}
