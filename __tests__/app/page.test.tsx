import Home from '@/app/page';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

describe('Page', () => {
  it('renders a heading', async () => {
    render(<Home />);

    const heading = await waitFor(() =>
      screen.getByRole('heading', { level: 1 })
    );

    expect(heading).toBeInTheDocument();
  });
});
