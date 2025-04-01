import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DailyStreakForm from '../../src/components/DailyForm';
import { handleStampSubmit } from '../../src/utils/handleStampSubmit';
import { getUserStamps } from '../../src/utils/getStamp';
import { storeStampData } from '../../src/utils/stampStore';
import { useRouter } from 'next/navigation';

jest
  .mock('../../src/utils/handleStampSubmit', () => ({
    handleStampSubmit: jest.fn(),
  }))
  .mock('next/navigation', () => ({
    useRouter: jest.fn(),
  }))
  .mock('../../src/utils/getStamp', () => ({
    getUserStamps: jest.fn(),
  }))
  .mock('../../src/utils/stampStore', () => ({
    storeStampData: jest.fn(),
  }));

describe('DailyStreakForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2025, 4, 1));
  });

  afterEach(() => {
    mockPush.mockClear();
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    render(<DailyStreakForm />);

    expect(screen.getByText(/Record Your Daily Streak/i)).toBeInTheDocument();
  });

  it('displays an error when fields are empty', async () => {
    render(<DailyStreakForm />);

    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    expect(
      await screen.findByText(/Please enter both username and PIN/i)
    ).toBeInTheDocument();
  });

  it('handles successful submission', async () => {
    handleStampSubmit.mockResolvedValueOnce({ success: true });
    getUserStamps.mockResolvedValueOnce({ success: true, stamps: [] });
    render(<DailyStreakForm />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: '1234' },
    });
    fireEvent.change(screen.getByTestId('note-textarea'), {
      target: { value: 'This is a note' },
    });

    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/stamp'));
    expect(storeStampData).toHaveBeenCalledWith({
      username: 'testuser',
      stamp: 0,
      mood: null,
      timestamp: Date.now(),
    });
  });

  it('handles successful submission with happy mood', async () => {
    handleStampSubmit.mockResolvedValueOnce({ success: true });
    getUserStamps.mockResolvedValueOnce({ success: true, stamps: [] });
    render(<DailyStreakForm />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: '1234' },
    });
    fireEvent.change(screen.getByTestId('note-textarea'), {
      target: { value: 'This is a note' },
    });
    fireEvent.click(screen.getByTestId('happy-mood'));

    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/stamp'));
    expect(storeStampData).toHaveBeenCalledWith({
      username: 'testuser',
      stamp: 0,
      mood: 'happy',
      timestamp: Date.now(),
    });
  });

  it('handles successful submission with sad mood', async () => {
    handleStampSubmit.mockResolvedValueOnce({ success: true });
    getUserStamps.mockResolvedValueOnce({ success: true, stamps: [] });
    render(<DailyStreakForm />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByTestId('sad-mood'));

    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/stamp'));
    expect(storeStampData).toHaveBeenCalledWith({
      username: 'testuser',
      stamp: 0,
      mood: 'sad',
      timestamp: Date.now(),
    });
  });

  it('handles successful submission when mood unchoosen', async () => {
    handleStampSubmit.mockResolvedValueOnce({ success: true });
    getUserStamps.mockResolvedValueOnce({ success: true, stamps: [] });
    render(<DailyStreakForm />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByTestId('happy-mood'));
    fireEvent.click(screen.getByTestId('happy-mood'));

    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/stamp'));
    expect(storeStampData).toHaveBeenCalledWith({
      username: 'testuser',
      stamp: 0,
      mood: null,
      timestamp: Date.now(),
    });
  });

  it('handles failed submission', async () => {
    handleStampSubmit.mockResolvedValueOnce({
      success: false,
      message: 'Invalid credentials',
    });
    render(<DailyStreakForm />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: '0000' },
    });

    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    await waitFor(() =>
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles failed fetch stamps data', async () => {
    handleStampSubmit.mockResolvedValueOnce({ success: true });
    getUserStamps.mockResolvedValueOnce({
      success: false,
      message: 'Username not found',
    });
    render(<DailyStreakForm />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: '1234' },
    });

    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    await waitFor(() =>
      expect(screen.getByText(/Username not found/i)).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
