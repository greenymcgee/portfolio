import SetupInstructions from './setup-instructions'

export default function SetupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Coming soon
        </h1>
        <p className="mb-8 text-center text-gray-600">
          It looks like your database isn&apos;t set up yet. Follow the
          instructions below to get started.
        </p>

        <SetupInstructions />
      </div>
    </div>
  )
}
