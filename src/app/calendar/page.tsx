'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  CalendarIcon,
  Lock,
  Milk,
  SmileIcon,
  FrownIcon,
  ShieldCheck,
  ShieldAlert,
  StickyNote,
  Flame,
} from 'lucide-react';
import { verifyUser } from '@/utils/verifyUser';
import { getUserStamps } from '@/utils/getStamp';
import { getUserStreakByUsername } from '@/utils/streaks';
import { DayData, MonthData, StreakData } from '../../types';

const getStreakData = async (username: string): Promise<StreakData> => {
  try {
    const { streakData } = await getUserStreakByUsername(username);

    if (!streakData) {
      throw new Error('No streak data found for this user');
    }

    return streakData;
  } catch (error) {
    throw error;
  }
};

const getStampsData = async (
  username: string,
  authorized: boolean
): Promise<DayData[]> => {
  try {
    const stampsData = await getUserStamps(username, authorized);

    return stampsData.data.stamps;
  } catch (error) {
    console.error('Error fetching stamps:', error);
    const data: DayData[] = [];
    return data;
  }
};

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  // Get username from URL params
  const username = searchParams.get('username') || '';

  useEffect(() => {
    const checkAuth = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        // Get PIN from sessionStorage
        const pin = sessionStorage.getItem('calendarPin') || '';

        // Verify user if PIN is provided
        if (pin) {
          await verifyUser({ username, pin });
          setAuthorized(true);
        }

        setCalendarData(await getStampsData(username, authorized));
        const streakData = await getStreakData(username);
        if (streakData.streak !== 0) {
          setStreak(streakData.streak);
        }

        sessionStorage.removeItem('calendarPin');
      } catch (error) {
        console.error('Error verifying user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [username, authorized]);

  // Handle return to home
  const handleReturn = () => {
    router.push('/');
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
    };
    const parts = date.toLocaleDateString('en-US', options).split(' ');
    const day = parts[0].replace(',', ''); // remove comma from day
    const weekday = parts[1].replace(',', '');
    return `${day}, ${weekday}`;
  };
  // Handle card click to toggle note expansion
  const toggleCard = (dateKey: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (expandedCards.has(dateKey)) {
      newExpandedCards.delete(dateKey);
    } else {
      newExpandedCards.add(dateKey);
    }
    setExpandedCards(newExpandedCards);
  };

  // Function to distribute items into columns
  const distributeIntoColumns = (items: DayData[], numColumns: number) => {
    const columns: DayData[][] = Array.from({ length: numColumns }, () => []);

    items.forEach((item, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(item);
    });

    return columns;
  };

  // Get responsive column count
  const getColumnCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg
      if (window.innerWidth >= 768) return 2; // md
    }
    return 1; // default/mobile
  };

  const [columnCount, setColumnCount] = useState(3);

  // Group data by month and year
  const groupDataByMonth = (data: DayData[]): MonthData[] => {
    const monthGroups: { [key: string]: DayData[] } = {};

    data.forEach((day) => {
      const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(day);
    });

    return Object.entries(monthGroups)
      .map(([key, days]) => {
        const [yearStr, monthStr] = key.split('-');
        const monthDate = new Date(
          Number.parseInt(yearStr),
          Number.parseInt(monthStr),
          1
        );
        return {
          month: monthDate.toLocaleDateString('en-US', { month: 'long' }),
          year: Number.parseInt(yearStr),
          days: days.sort((a, b) => a.date.getTime() - b.date.getTime()),
        };
      })
      .sort((a, b) => {
        const aDate = new Date(
          a.year,
          new Date(`${a.month} 1, ${a.year}`).getMonth()
        );
        const bDate = new Date(
          b.year,
          new Date(`${b.month} 1, ${b.year}`).getMonth()
        );
        return bDate.getTime() - aDate.getTime(); // Most recent first
      });
  };

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-gray-800 bg-gray-900">
          <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg border-b border-gray-800">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-red-400" />
            </div>
            <CardTitle className="text-red-400 text-center">
              Invalid Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-300 mb-6">
              Please provide a username to view the calendar.
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

  const monthlyData = groupDataByMonth(calendarData);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg border-gray-800 bg-gray-900 mb-6">
          <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-lg border-b border-gray-800 pt-6 -mt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-purple-400 mr-2" />
                <CardTitle className="text-purple-400">
                  Daily Stamp Calendar
                </CardTitle>
              </div>
              <div className="flex items-center">
                {authorized ? (
                  <div className="flex items-center text-green-400 text-sm">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Authorized View
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400 text-sm">
                    <ShieldAlert className="h-4 w-4 mr-1" />
                    Public View
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Milk className="h-5 w-5 text-purple-400 mr-2" />
              <span className="text-white font-medium">
                {username}&apos;s Stamp History
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {streak > 0 && (
              <div className="flex items-center justify-center mb-2 ml-2.5">
                <div className="text-5xl font-bold text-white">{streak}</div>
                <Flame className="h-12 w-12 text-orange-300 fill-orange-700" />
              </div>
            )}
            <div className="mb-4 text-center">
              <h3 className="text-gray-300 text-lg mb-2">Stamp History</h3>
            </div>
            <div className="space-y-8">
              {monthlyData.map((monthData) => {
                const columns = distributeIntoColumns(
                  monthData.days,
                  columnCount
                );
                return (
                  <div
                    key={`${monthData.month}-${monthData.year}`}
                    className="space-y-4"
                  >
                    {/* Month Header */}
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-white">
                        {monthData.month}, {monthData.year}
                      </h3>
                      <div className="text-sm text-gray-400">
                        {monthData.days.length}{' '}
                        {monthData.days.length === 1 ? 'stamp' : 'stamps'}
                      </div>
                    </div>

                    {/* Month Calendar */}
                    <div className="flex gap-4">
                      {columns.map((column, columnIndex) => (
                        <div
                          key={columnIndex}
                          className="flex-1 flex flex-col gap-4"
                        >
                          {column.map((day) => {
                            const dateKey = day.date.toISOString();
                            return (
                              <div
                                key={dateKey}
                                className="relative transition-all duration-300 ease-in-out"
                              >
                                {/* Main stamp card */}
                                <div
                                  className={`bg-gray-800 rounded-md border border-gray-700 p-3 flex items-center justify-between transition-all duration-300 ease-in-out min-h-16 ${
                                    day.note
                                      ? 'cursor-pointer hover:bg-gray-750'
                                      : ''
                                  } ${expandedCards.has(dateKey) ? 'rounded-b-none' : ''}`}
                                  onClick={() =>
                                    day.note && toggleCard(dateKey)
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <div className="text-gray-300 font-medium">
                                        {formatDate(day.date)}
                                      </div>
                                      {/* <div className="text-purple-300 text-sm">
                                        Daily stamp recorded
                                      </div> */}
                                    </div>

                                    {/* Note indicator */}
                                    {day.note && (
                                      <div className="ml-2">
                                        <StickyNote className="h-4 w-4 text-yellow-400" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {true && day.mood && (
                                      <div
                                        className={`rounded-full p-2 ${
                                          day.mood === 'happy'
                                            ? 'bg-green-900/50'
                                            : 'bg-blue-900/50'
                                        }`}
                                      >
                                        {day.mood === 'happy' ? (
                                          <SmileIcon className="h-5 w-5 text-green-400" />
                                        ) : (
                                          <FrownIcon className="h-5 w-5 text-blue-400" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Expandable note sub-card */}
                                {day.note && (
                                  <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                      expandedCards.has(dateKey)
                                        ? 'max-h-32 opacity-100'
                                        : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="bg-gray-800/60 border-l border-r border-b border-gray-700/50 rounded-b-md p-3">
                                      <p className="text-gray-400 text-sm italic">
                                        &quot;{day.note}&quot;
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {calendarData.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No streak data found for this user.
              </div>
            )}
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
    </div>
  );
}
