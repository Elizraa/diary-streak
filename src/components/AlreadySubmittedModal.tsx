'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon, CheckCircle } from 'lucide-react';

type AlreadySubmittedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  username: string;
};

export default function AlreadySubmittedModal({
  isOpen,
  onClose,
  username,
}: AlreadySubmittedModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleViewCalendar = () => {
    // Store the username in sessionStorage for the calendar view
    sessionStorage.setItem('calendarUsername', username);

    // Close the modal and navigate to the calendar page
    setOpen(false);
    onClose();
    router.push(`/calendar?username=${encodeURIComponent(username)}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-gray-700 bg-gray-900">
        <DialogHeader className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg -mt-4 -mx-4 mb-4 border-b border-gray-800">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <DialogTitle className="text-green-400 text-center">
            Already Recorded Today
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            You&apos;ve already recorded your dairy consumption for today.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-gray-300 mb-4">
            Would you like to view your streak calendar instead?
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            onClick={handleViewCalendar}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 flex-1"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
