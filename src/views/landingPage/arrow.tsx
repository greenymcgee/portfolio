import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useWindowSize } from '../../common/hooks';

const EXTRA_SMALL_DEVICES = 370;

export function LandingPageArrow() {
  const { width } = useWindowSize();

  if (width <= EXTRA_SMALL_DEVICES) return null;

  return (
    <span aria-label="Scroll Down">
      <FontAwesomeIcon
        className={clsx(
          'absolute inset-1/2 pt-6 text-xl text-secondary-800',
          'sm:text-2xl lg:text-3xl',
        )}
        icon={faArrowDown}
      />
    </span>
  );
}
