import CalendarModal from '@/components/CalenderModal';
import DailyForm from '@/components/DailyForm';
import SignupModal from '@/components/SignupModal';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        <DailyForm />
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <SignupModal />
          <CalendarModal />
        </div>
      </div>
    </div>
  );
}
