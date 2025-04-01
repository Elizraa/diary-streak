import DailyStreakForm from '@/components/DailyForm';
import { render } from '@testing-library/react';
import { act } from 'react';

it('renders Daily Streak Form unchanged', async () => {
  let container;

  await act(async () => {
    ({ container } = render(<DailyStreakForm />));
  });

  expect(container).toMatchSnapshot();
});
