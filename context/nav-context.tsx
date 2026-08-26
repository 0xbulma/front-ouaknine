import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import useEventListener from '../hooks/useEventListener';

// `isOn` starts null rather than false: the burger animation runs on the change,
// and a false on the first render would play the closing one on every load.
export type NavState = {
  isOn: boolean | null;
  toggleNav: () => void;
  removeNav: () => void;
};

export const NavContextSchema = createContext<NavState>({
  isOn: null,
  toggleNav: () => {},
  removeNav: () => {},
});

function NavContext(props: { children: ReactNode }) {
  const [state, setState] = useState<NavState>({
    isOn: null,
    toggleNav: () => {
      setState(prevState => ({ ...prevState, isOn: !prevState.isOn }));
    },
    removeNav: () => {
      setState(prevState => ({ ...prevState, isOn: false }));
    },
  });

  useEventListener('scroll', () => {
    if (state.isOn) {
      globalThis.scrollTo(0, 0);
    }
  });
  useEventListener('touchstart', () => {
    if (state.isOn) {
      globalThis.scrollTo(0, 0);
    }
  });

  useEffect(() => {
    if (state.isOn) {
      document.body.classList.add('body-full');
    }

    if (state.isOn === false) {
      document.body.classList.remove('body-full');
    }
  }, [state.isOn]);

  const closeNav = () => {
    if (globalThis.innerWidth > 992) {
      state.removeNav();
    }
  };
  useEventListener('resize', closeNav);

  return (
    <NavContextSchema.Provider value={state}>
      {props.children}
    </NavContextSchema.Provider>
  );
}

export default NavContext;
