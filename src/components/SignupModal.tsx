'use client';

import type React from 'react';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { registerUser } from '@/utils/registerUser';

export default function SignupModal() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    // Form validation
    if (!username || !pin || !confirmPin) {
      setError('Please fill in all fields');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (pin.length < 4) {
      setError('PIN must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await registerUser(username, pin);

    // Reset form
    setUsername('');
    setPin('');
    setConfirmPin('');

    console.log(result);

    if (!result.success) {
      if (
        result.message ===
        'duplicate key value violates unique constraint "users_username_key"'
      ) {
        setError('Username already exist');
        setIsLoading(false);
        return;
      }
      setError(result.message || 'Failed to create account. Please try again.');
      setIsLoading(false);
      return;
    }
    setSuccess(true);

    // Close modal after a delay
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
    }, 2000);
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-purple-400"
        >
          Create Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-gray-700 bg-gray-900">
        <DialogHeader className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg -mt-6 -mx-6 mb-4 border-b border-gray-800">
          <DialogTitle className="text-purple-400">
            Create a Day Streak Account
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign up to start tracking your day streak.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSignup} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="signup-username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white focus-visible:ring-purple-500 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-pin" className="text-gray-300">
              PIN
            </Label>
            <Input
              id="signup-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Choose a PIN"
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white focus-visible:ring-purple-500 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin" className="text-gray-300">
              Confirm PIN
            </Label>
            <Input
              id="confirm-pin"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm your PIN"
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white focus-visible:ring-purple-500 placeholder:text-gray-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {success && (
            <div className="bg-gray-800 p-3 rounded-md border border-green-900">
              <p className="text-green-400 text-sm">
                Account created successfully!
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
