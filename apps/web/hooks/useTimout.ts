import { useEffect, useRef } from "react";

// Runs `callback` once, `delay` ms after mount, and re-arms if the delay
// changes. The callback lives in a ref so that a fresh closure on every render
// does not restart the timer.
//
// It used to return a `reset`/`clear` pair, wrapped in useCallback only to keep
// them out of the effect's dependency array. The one caller
// (components/layout/cookie.tsx) never read either, and an effect that owns its
// own timer needs neither.
export default function useTimeout(callback: () => void, delay: number): void {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const id = setTimeout(() => callbackRef.current(), delay);
		return () => clearTimeout(id);
	}, [delay]);
}
