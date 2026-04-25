# AGENTS.md

## Core Concepts

- **Clean Authoring**: [Clean Authoring](.cursor/skills/clean-authoring/SKILL.md)

## Core Technologies

- [Next.js](https://nextjs.org/)
- [NextAuth.js v4](https://next-auth.js.org/)
- [Prisma Postgres](https://www.prisma.io/postgres)
- [Prisma ORM](https://www.prisma.io/orm)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker Compose](https://docs.docker.com/compose/) - for local development and testing
- [Neverthrow](https://github.com/supermacro/neverthrow)

### Testing

All tests must follow the rules in [VITEST_RULES.mdc](.cursor/rules/VITEST_RULES.mdc).

- [Vitest](https://vitest.dev/)
- [V8 Coverage](https://vitest.dev/guide/coverage.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [msw](https://github.com/mswjs/msw)
- [Faker.js](https://github.com/faker-js/faker)
- [Fishery](https://github.com/thoughtbot/fishery)
- [next-router-mock](https://github.com/scottrippey/next-router-mock)

### Linting & Formatting

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Spellcheck](https://cspell.org/)

## High-level Architecture

### Directory Structure

- `app/` - Next.js app directory
- `docs/` - documentation for projects
- `features/` - domain-specific features
- `globals/` - reusable tools such as constants, components, hooks, utils, etc.
- `lib/` - tools that help in implementing libraries
- `prisma/` - this directory contains Prisma-specific code and the schema
- `providers/` - any custom providers for the app
- `public/` - the public directory for static assets
- `test/` - test helper code
- `types/` - global type definitions

### Key Patterns

1. **Backend**: Follows patterns similar to NestJS with DTOs, services, and repositories. Typically no controller is involved, but instead a server action.
2. **Frontend**: Uses Shadcn UI for components and Tailwind CSS for styling.
3. **Testing**: Uses Vitest for testing and React Testing Library for testing React components.
4. **Authentication**: Uses NextAuth.js v4 for authentication.

### Important Models

- `User` - The user model is used to store user information.
- `Post` - The post model is used to store post information.

### TypeScript Conventions

- Global types are stored in the `types/` directory. They should be .d.ts files.
- [@greenymcgee/utility-types](https://github.com/greenymcgee/tacklebox/tree/main/packages/utility-types) is used for global types.
