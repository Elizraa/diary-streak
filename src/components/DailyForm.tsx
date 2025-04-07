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
import { BookOpenCheck, FrownIcon, Loader2, SmileIcon } from 'lucide-react';
import { handleStampSubmit } from '@/utils/handleStampSubmit';
import { storeStampData } from '@/utils/stampStore';

type Mood = 'happy' | 'sad' | null;

export default function DailyStreakForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [mood, setMood] = useState<Mood>(null);
  const [notes, setNotes] = useState('');
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

    const result = await handleStampSubmit({ username, pin, notes, mood });

    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    const streak = result.streak ?? 0;

    // Store the streak data in sessionStorage
    storeStampData({
      username,
      streak: streak,
      mood,
      timestamp: Date.now(),
    });

    // Navigate to the streak page without query parameters
    router.push('/stamp');
  }

  const handleMood = (moodChosen: Mood) => {
    if (moodChosen === mood) {
      setMood(null);
      return;
    }

    setMood(moodChosen);
  };

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
      <CardContent className="bg-gray-900">
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
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">
              How are you feeling today?{' '}
              <span className="text-gray-500 text-sm">(optional)</span>
            </Label>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => handleMood('happy')}
                className={`flex-1 h-16 ${
                  mood === 'happy'
                    ? 'bg-green-600 hover:bg-green-700 border-2 border-green-400'
                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                }`}
                disabled={isLoading}
                data-testid="happy-mood"
              >
                <SmileIcon
                  className={`h-8 w-8 ${mood === 'happy' ? 'text-white' : 'text-gray-400'}`}
                />
              </Button>

              <Button
                type="button"
                onClick={() => handleMood('sad')}
                className={`flex-1 h-16 ${
                  mood === 'sad'
                    ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400'
                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                }`}
                disabled={isLoading}
                data-testid="sad-mood"
              >
                <FrownIcon
                  className={`h-8 w-8 ${mood === 'sad' ? 'text-white' : 'text-gray-400'}`}
                />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-gray-300">
              Notes <span className="text-gray-500 text-sm">(optional)</span>
            </Label>
            <textarea
              id="note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Is there a noteworthy event today, or what do you hope will happen?"
              disabled={isLoading}
              className="shadow-xs focus-visible:border-ring focus-visible:ring-[3px] border border-gray-700 bg-gray-800 rounded-xl text-white focus-visible:ring-purple-500 placeholder:text-gray-500 p-2 w-full h-32 resize-y"
              rows={4}
              style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                textAlign: 'left',
              }}
              data-testid="note-textarea"
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-0.5">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-5"
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
        <p className="text-sm text-gray-400 inline-flex items-center">
          Keep up your daily stamp for commitment!{' '}
          <BookOpenCheck className="ml-1 text-orange-300" />
        </p>
      </CardFooter>
    </Card>
  );
}
