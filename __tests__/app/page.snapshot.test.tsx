import Home from '@/app/page';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

it('renders homepage unchanged', async () => {
  let container;

  await act(async () => {
    ({ container } = render(<Home />));
  });

  expect(container).toMatchSnapshot();
});
