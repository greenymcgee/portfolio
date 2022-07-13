/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LandingPageHeader } from '../../../src/views/landingPage/header';

describe('LandingPageHeader tests', () => {
  it('should render', async () => {
    render(<LandingPageHeader />);
    expect(screen.getByText('Hello, my name is')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('Houston Green');
    expect(screen.getByText('I write custom web applications,')).toBeDefined();
    expect(
      screen.getByText("and I'd like to talk about that... just a little"),
    ).toBeInTheDocument();

    await screen.findByLabelText('Scroll Down');
  });
});
