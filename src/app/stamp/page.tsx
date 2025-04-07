'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpenCheck,
  ArrowLeft,
  Lock,
  Flame,
  SmileIcon,
  FrownIcon,
} from 'lucide-react';
import {
  getStampData,
  isStampDataValid,
  clearStampData,
} from '@/utils/stampStore';

export default function StampPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [streak, setStreak] = useState(0);
  const [mood, setMood] = useState<string | null>(null);

  useEffect(() => {
    // Check if the stamp data exists and is valid
    if (isStampDataValid()) {
      const data = getStampData();
      if (data) {
        setUsername(data.username);
        setStreak(data.streak);
        setMood(data.mood || null);
        setAuthorized(true);
      }
    }

    setLoading(false);

    // Cleanup function to clear data when leaving the page
    return () => {
      clearStampData();
    };
  }, []);

  // Handle return to home
  const handleReturn = () => {
    clearStampData();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If not authorized, show access denied
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-gray-800 bg-gray-900">
          <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg border-b border-gray-800 pt-6 -mt-5">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-red-400" />
            </div>
            <CardTitle className="text-red-400 text-center">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-300 mb-6">
              This page can only be accessed after submitting your daily stamp.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
            <Button
              onClick={handleReturn}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-800 bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg border-b border-gray-800 pt-6 -mt-5">
          <div className="flex items-center justify-center">
            <BookOpenCheck className="h-20 w-20 text-orange-400" />
          </div>
          <CardTitle className="text-orange-400 text-2xl text-center">
            Stamp Recorded!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Flame className="h-8 w-8 text-orange-300 mr-2" />
            <h2 className="text-xl font-semibold text-white">
              {username}&apos;s Daily Stamp
            </h2>
          </div>

          <div className="bg-gray-800 p-6 rounded-md border border-gray-700 mb-6">
            <div className="text-5xl font-bold text-white mb-2">{streak}</div>
            <p className="text-purple-300">{streak === 1 ? 'Day' : 'Days'}</p>
          </div>

          {mood && (
            <div
              className={`p-4 rounded-md border mb-6 flex items-center justify-center gap-3 ${
                mood === 'happy'
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-blue-900/30 border-blue-700'
              }`}
            >
              {mood === 'happy' ? (
                <SmileIcon className="h-6 w-6 text-green-400" />
              ) : (
                <FrownIcon className="h-6 w-6 text-blue-400" />
              )}
              <p
                className={`${mood === 'happy' ? 'text-green-300' : 'text-blue-300'}`}
              >
                You were feeling {mood === 'happy' ? 'happy' : 'sad'} today
              </p>
            </div>
          )}

          <div className="text-gray-300">
            <p className="mb-2">
              {streak < 5
                ? "Keep going! You're building a great habit."
                : streak < 10
                  ? 'Impressive number! Your consistency is paying off.'
                  : "Amazing dedication! You're a stamp champion!"}
            </p>
            <p className="text-sm text-gray-400">
              Remember to come back tomorrow to continue your stamp!
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
          <Button
            onClick={handleReturn}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
