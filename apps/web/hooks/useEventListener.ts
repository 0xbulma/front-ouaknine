import { useEffect, useRef } from "react";

// A window listener whose handler can change on every render without
// re-subscribing: the current one is kept in a ref and read at dispatch time.
// Subscribed inside an effect, so `window` is only touched in the browser.
const useEventListener = <K extends keyof WindowEventMap>(
	eventName: K,
	handler: (event: WindowEventMap[K]) => void,
): void => {
	const savedHandler = useRef(handler);

	useEffect(() => {
		savedHandler.current = handler;
	}, [handler]);

	useEffect(() => {
		const eventListener = (event: WindowEventMap[K]) => savedHandler.current(event);
		window.addEventListener(eventName, eventListener);
		return () => {
			window.removeEventListener(eventName, eventListener);
		};
	}, [eventName]);
};

export default useEventListener;
