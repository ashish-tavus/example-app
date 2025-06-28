import CreateMeetingButton from "./components/CreateMeetingButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center max-w-2xl w-full">
        {/* Tavus Meeting Section */}
        <div className="flex flex-col gap-6 items-center text-center">
          <h1 className="text-4xl font-bold">Tavus Meeting Integration</h1>
          <p className="text-xl text-gray-600 max-w-lg">
            Create a meeting with Hassaan, one of the co-founders of Tavus, using AI-powered conversation technology.
          </p>
          <CreateMeetingButton />
        </div>
      </main>
    </div>
  );
}
