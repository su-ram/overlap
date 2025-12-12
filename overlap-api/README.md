# overlap-api

GraphQL API server bootstrapped with NestJS (Apollo driver) to pair with the existing web app.
It currently serves an in-memory event graph that mirrors the `/new`, `/moim/[id]`, and `/timetable`
routes in `overlap-web`. Swap the in-memory store for a DB-backed repository when the schema is ready.

## Getting started
1. Install dependencies (registry access required):
   ```bash
   npm install
   ```
2. Run in development with auto-reload:
   ```bash
   npm run start:dev
   ```
3. Build and run production bundle:
   ```bash
   npm run build
   npm start
   ```

The GraphQL playground will be available at `http://localhost:4000/graphql` by default.

## GraphQL surface (aligned to overlap-web routes)

| Web route | GraphQL operation | Notes |
| --- | --- | --- |
| `/new` | `mutation createEvent(input: CreateEventInput): Event` | Returns a generated `id` you can push to `/moim/{id}`. |
| `/moim/[id]` | `query event(id: ID!): Event` | Provides participants, timetable grid, and top time slots for the detail page. |
| `/moim/[id]/join` | `mutation joinEvent(input: JoinEventInput): Event` | Adds a participant and (optionally) their availability keys. |
| `/timetable` | `mutation updateAvailability(input: UpdateAvailabilityInput): Event` | Updates a participant grid; planned to sync with DB/Supabase later. |

### Seed data
- A sample event is preloaded with `id: "sample-moim-1"` to let the UI render without a DB.
- Availability grid uses slot keys like `2024-08-05@10:00` (matching the timetable mock dates `8/5`–`8/8`).

### Example queries

Fetch an event for the `/moim/[id]` page:
```graphql
query EventById($id: ID!) {
  event(id: $id) {
    id
    title
    location
    participants { id name availabilityKeys }
    topSlots { slotKey label votes }
    timetable { dayLabel date hour availability }
  }
}
```

Create an event (used by `/new`) and redirect with the returned `id`:
```graphql
mutation CreateEvent {
  createEvent(input: { title: "회식", location: "서울", maxParticipants: 8 }) {
    id
    title
  }
}
```

Join an event with optional availability seeds for `/moim/[id]/join`:
```graphql
mutation JoinEvent {
  joinEvent(input: { eventId: "sample-moim-1", name: "신규 참가자", availabilityKeys: ["2024-08-05@10:00"] }) {
    participants { id name }
    topSlots { label votes }
  }
}
```

## Environment
- Requires Node.js 18+
- The server honors the `PORT` environment variable.

## npm install troubleshooting
- This project ships a local `.npmrc` that points to the public npm registry and turns on a few automatic retries.
- If you see a `403 Forbidden` when downloading packages, it usually means a corporate or MITM proxy is intercepting the request. Try the following before running `npm install`:
  ```bash
  # Disable proxy variables for this shell (if you have direct internet access)
  export HTTP_PROXY="" HTTPS_PROXY="" http_proxy="" https_proxy="" NO_PROXY="*" no_proxy="*"

  # or, explicitly set the proxy npm should use
  npm config set proxy "$HTTP_PROXY"
  npm config set https-proxy "$HTTPS_PROXY"
  ```
- If registry access is entirely blocked in your environment, you will need to point `registry` in `.npmrc` to an internal mirror such as Verdaccio or Artifactory.
