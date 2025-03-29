<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# ACME Backend as a Service (BaaS)

A platform that allows users to create and manage projects with their own PostgreSQL databases and automatically generated GraphQL APIs.

## Monorepo Structure

This project is organized as a monorepo with the following packages:

- `packages/admin-backend`: NestJS backend that manages users, projects, and generates GraphQL APIs using PostGraphile
- `packages/admin-frontend`: React frontend for the admin interface

## Features

- User authentication with JWT
- Project creation and management
- Automatic database provisioning for each project
- Auto-generated GraphQL API for each project using PostGraphile
- API Explorer with GraphQL Playground

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v14+)
- Redis
- pnpm (for package management)

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

Copy the example environment file and adjust as needed:

```bash
cp packages/admin-backend/.env.example packages/admin-backend/.env
```

4. Start the development servers:

```bash
# Run both backend and frontend
pnpm dev

# Run only backend
pnpm dev:backend

# Run only frontend
pnpm dev:frontend
```

The backend will be available at http://localhost:6868 and the frontend at http://localhost:3002.

## Building for Production

```bash
pnpm build
```

This will build both the backend and frontend packages.

## Project Structure

### Backend (`packages/admin-backend`)

- `src/` - NestJS application source code
  - `auth/` - Authentication and authorization modules
  - `entities/` - TypeORM entity definitions
  - `middlewares/` - Middleware including GraphQL generator
  - `projects/` - Project management module
  - `redis/` - Redis service for caching
  - `plugins/` - PostGraphile plugins

### Frontend (`packages/admin-frontend`)

- `src/` - React application source code
  - `components/` - Reusable React components
  - `pages/` - Main application pages
  - `services/` - API service clients
  - `hooks/` - Custom React hooks
  - `store/` - State management

## License

[MIT](LICENSE)
