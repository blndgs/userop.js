![](https://i.imgur.com/mR5CsOr.png)

# Getting started

A simple JS library for building ERC-4337 UserOperations.

> **🚀 Looking for access to hosted infrastructure to build your Smart Accounts? Check out [stackup.sh](https://www.stackup.sh/)!**

# Usage

See the `userop` documentation at [docs.stackup.sh](https://docs.stackup.sh/docs/useropjs).

# Contributing

## Prerequisites

- Node 16 or later

## Setup

Install dependencies:

```bash
yarn install
```

Run tests:

```bash
yarn test
```

# License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

# Contact

Feel free to direct any technical related questions to the `dev-hub` channel in the [Stackup Discord](https://discord.gg/VTjJGvMNyW).

### Key Modifications

- **User-Agent Header for RPC Requests**: Added support for setting a custom `User-Agent` header in all RPC requests. This modification allows requests to comply with WAF (Web Application Firewall) requirements that may require a specific `User-Agent` value.

  The `User-Agent` can be set dynamically via environment variables or defaults to a custom value. Here’s an example:

  ```javascript
  import { Client } from "./path-to-client";

  // Example setup with dynamic User-Agent
  const client = new Client("https://rpc-url", {
      userAgent: process.env.USER_AGENT || "YourCustomUserAgent/1.0.0"
  });
