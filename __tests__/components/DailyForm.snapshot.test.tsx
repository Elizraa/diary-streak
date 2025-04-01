import DailyStreakForm from '@/components/DailyForm';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

it('renders Daily Streak Form unchanged', async () => {
  let container;

  await act(async () => {
    ({ container } = render(<DailyStreakForm />));
  });

  expect(container).toMatchSnapshot();
});
