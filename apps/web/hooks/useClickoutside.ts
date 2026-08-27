import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect } from "react";

const useClickOutside = (
	state: boolean,
	setState: Dispatch<SetStateAction<boolean>>,
	ref: RefObject<HTMLElement | null>,
): void => {
	useEffect(() => {
		if (!state) return;
		function handleClick(event: MouseEvent) {
			const { target } = event;
			if (ref.current && target instanceof Node && !ref.current.contains(target)) {
				setState(false);
			}
		}
		globalThis.addEventListener("click", handleClick);
		// clean up
		return () => globalThis.removeEventListener("click", handleClick);
	}, [state, setState, ref]);
};

export default useClickOutside;
