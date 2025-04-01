import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DailyStreakForm from '../../src/components/DailyForm';
import { handleStampSubmit } from '../../src/utils/handleStampSubmit';
import { useRouter } from 'next/navigation';

jest
  .mock('../../src/utils/handleStampSubmit', () => ({
    handleStampSubmit: jest.fn(),
  }))
  .mock('next/navigation', () => ({
    useRouter: jest.fn(),
  }));

describe('DailyStreakForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
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

    render(<DailyStreakForm />);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByText(/Submit Daily Stamp/i));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/stamp'));
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
  });
});
