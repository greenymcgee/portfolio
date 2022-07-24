/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { WelcomeHeader } from '../../../src/views/landingPage';

describe('WelcomeHeader tests', () => {
  it('should render', () => {
    render(<WelcomeHeader />);
    expect(screen.getByText("Let's Build Together")).toBeInTheDocument();
    expect(
      screen.getByText('I mostly build websites, but Legos are cool too.'),
    ).toBeInTheDocument();
  });
});
