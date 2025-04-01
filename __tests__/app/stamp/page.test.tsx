import StampPage from '@/app/stamp/page';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

it('renders Stamp Page unchanged', async () => {
  let container;

  await act(async () => {
    ({ container } = render(<StampPage />));
  });

  expect(container).toMatchSnapshot();
});
