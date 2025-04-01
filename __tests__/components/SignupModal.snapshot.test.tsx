import SignupModal from '@/components/SignupModal';
import { render } from '@testing-library/react';
import { act } from 'react';

it('renders Sign Up Modal unchanged', async () => {
  let container;

  await act(async () => {
    ({ container } = render(<SignupModal />));
  });

  expect(container).toMatchSnapshot();
});
