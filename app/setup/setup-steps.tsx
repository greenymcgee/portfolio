import { CodeBlock } from './code-block'

export default function SetupSteps() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Getting Started
        </h2>
        <p className="mb-4 text-gray-600">
          Follow these steps to set up your Next.js & Prisma Postgres Auth
          Starter:
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-800">
          1. Install Dependencies
        </h3>
        <p className="mb-3 text-gray-600">
          After cloning the repo and navigating into it, install dependencies:
        </p>
        <CodeBlock code="npm install" />
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-800">
          2. Create a Prisma Postgres Instance
        </h3>
        <p className="mb-3 text-gray-600">
          Create a Prisma Postgres instance by running the following command:
        </p>
        <CodeBlock code="npx prisma init --db" />
        <p className="mt-3 text-gray-600">
          This command is interactive and will prompt you to:
        </p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-gray-600">
          <li>Log in to the Prisma Console</li>
          <li>
            Select a <strong>region</strong> for your Prisma Postgres instance
          </li>
          <li>
            Give a <strong>name</strong> to your Prisma project
          </li>
        </ol>
        <p className="mt-3 text-gray-600">
          Once the command has terminated, copy the{' '}
          <strong>Database URL</strong> from the terminal output. You&apos;ll
          need it in the next step.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-800">
          3. Set Up Your .env File
        </h3>
        <p className="mb-3 text-gray-600">
          You need to configure your database connection via an environment
          variable.
        </p>
        <p className="mb-3 text-gray-600">
          First, create an <code>.env</code> file:
        </p>
        <CodeBlock code="touch .env" />
        <p className="mt-3 mb-3 text-gray-600">
          Then update the <code>.env</code> file by replacing the existing{' '}
          <code>DATABASE_URL</code> value with the one you previously copied:
        </p>
        <CodeBlock
          code={`DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=PRISMA_POSTGRES_API_KEY"`}
        />
        <p className="mt-3 mb-3 text-gray-600">
          To ensure your authentication works properly, you&apos;ll also need to
          set env vars for NextAuth.js:
        </p>
        <CodeBlock code={`AUTH_SECRET="RANDOM_32_CHARACTER_STRING"`} />
        <p className="mt-3 mb-3 text-gray-600">
          You can generate a random 32 character string for the{' '}
          <code>AUTH_SECRET</code> with this command:
        </p>
        <CodeBlock code="npx auth secret" />
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-800">
          4. Migrate the Database
        </h3>
        <p className="mb-3 text-gray-600">
          Run the following command to set up your database and Prisma schema:
        </p>
        <CodeBlock code="npx prisma migrate dev --name init" />
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-800">
          5. Seed the Database
        </h3>
        <p className="mb-3 text-gray-600">Add initial data to your database:</p>
        <CodeBlock code="npx prisma db seed" />
      </section>

      <section>
        <h3 className="mb-3 text-xl font-semibold text-gray-800">
          6. Run the App
        </h3>
        <p className="mb-3 text-gray-600">Start the development server:</p>
        <CodeBlock code="npm run dev" />
        <p className="mt-3 text-gray-600">
          Once the server is running, visit <code>http://localhost:3000</code>{' '}
          to start using the app.
        </p>
      </section>
    </div>
  )
}
