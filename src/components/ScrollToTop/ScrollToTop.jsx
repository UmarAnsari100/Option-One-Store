import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Reset document focus on route transition to prevent focus traps
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
