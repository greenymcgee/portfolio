/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { LandingPageArrow } from '../../../src/views/landingPage/arrow';

const width = window.innerWidth;

afterEach(() => {
  window.innerWidth = width;
});

describe('LandingPageArrow tests', () => {
  it('should not render if window width is less than 370', () => {
    window.innerWidth = 200;
    const { container } = render(<LandingPageArrow />);
    expect(container.getElementsByTagName('svg').length).toBe(0);
  });

  it('should render if it window width is greater than 370', () => {
    window.innerWidth = 400;
    const { container } = render(<LandingPageArrow />);
    expect(container.getElementsByTagName('svg').length).toBe(1);
  });
});
