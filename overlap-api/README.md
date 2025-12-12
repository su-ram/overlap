# overlap-api

GraphQL API server bootstrapped with NestJS (Apollo driver) to pair with the existing web app.

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
