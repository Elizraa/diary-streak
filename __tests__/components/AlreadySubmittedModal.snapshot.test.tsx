import AlreadySubmittedModal from '@/components/AlreadySubmittedModal';
import { render } from '@testing-library/react';
import { act } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  username: 'testuser',
};

it('renders Already Submitted Modal correctly', async () => {
  let container;

  await act(async () => {
    ({ container } = render(<AlreadySubmittedModal {...mockProps} />));
  });

  expect(container).toMatchSnapshot();
});
