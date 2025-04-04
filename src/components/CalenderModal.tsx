'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarIcon } from 'lucide-react';

export default function CalendarModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function handleViewCalendar(e: React.FormEvent) {
    e.preventDefault();

    if (!username) {
      setError('Please enter a username');
      return;
    }

    // Store PIN in sessionStorage if provided
    if (pin) {
      // Store the PIN temporarily in sessionStorage
      sessionStorage.setItem('calendarPin', pin);
    } else {
      // Clear any existing PIN
      sessionStorage.removeItem('calendarPin');
    }

    // Navigate to calendar page with only username in URL
    setOpen(false);
    router.push(`/calendar?username=${encodeURIComponent(username)}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-purple-400"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          View Calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-gray-700 bg-gray-900">
        <DialogHeader className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg -mt-4 -mx-4 mb-4 border-b border-gray-800">
          <DialogTitle className="text-purple-400">
            View Streak Calendar
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your username to view your dairy streak calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleViewCalendar} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="calendar-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="border-gray-700 bg-gray-800 text-white focus-visible:ring-purple-500 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calendar-pin" className="text-gray-300">
              PIN (Optional)
            </Label>
            <Input
              id="calendar-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN for full access"
              className="border-gray-700 bg-gray-800 text-white focus-visible:ring-purple-500 placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              Entering your PIN will show detailed information.
            </p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <DialogFooter>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              View Calendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
