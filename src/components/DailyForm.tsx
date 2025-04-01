'use client';

import type React from 'react';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { handleStampSubmit } from '@/utils/handleStampSubmit';
import { storeStampData } from '@/utils/stampStore';
import { getUserStamps } from '@/utils/getStamp';

export default function DailyStreakForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username || !pin) {
      setError('Please enter both username and PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await handleStampSubmit({ username, pin });

    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    const resultStamps = await getUserStamps(username);

    if (!resultStamps.success) {
      setError(resultStamps.message);
      setIsLoading(false);
      return;
    }

    // Store the streak data in sessionStorage
    storeStampData({
      username,
      stamp: resultStamps.stamps.length,
      timestamp: Date.now(),
    });

    // Navigate to the streak page without query parameters
    router.push('/stamp');
  }

  return (
    <Card className="w-full shadow-lg border-gray-800 bg-gray-900">
      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg border-b border-gray-800 pt-6 -mt-5">
        <CardTitle className="text-purple-400">
          Record Your Daily Streak
        </CardTitle>
        <CardDescription className="text-gray-400">
          Enter your username and PIN to log today&apos;s stamp
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white focus-visible:ring-purple-500 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-gray-300">
              PIN
            </Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white focus-visible:ring-purple-500 placeholder:text-gray-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              'Submit Daily Stamp'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-800 pt-4 bg-gray-900 rounded-b-lg">
        <p className="text-sm text-gray-400">
          Keep up your dairy streak for better health!
        </p>
      </CardFooter>
    </Card>
  );
}
