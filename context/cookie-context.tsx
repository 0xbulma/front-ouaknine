import type { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";
import deleteAllCookies from "../libs/deleteCookies";

// `isAccepted` is three-valued on purpose: null until the stored answer has been
// read, so the layout does not load the analytics script for a visitor who has
// already declined.
export type CookieState = {
	isAccepted: boolean | null;
	isRead: boolean;
	doNotShow: boolean;
	readCookie: () => void;
	acceptCookie: () => void;
	denyCookie: () => void;
	toggleCookie: (accepted: boolean | null) => void;
};

export const CookieContextSchema = createContext<CookieState>({
	isAccepted: null,
	isRead: false,
	doNotShow: false,
	readCookie: () => {},
	acceptCookie: () => {},
	denyCookie: () => {},
	toggleCookie: () => {},
});

function CookieContext(props: { children: ReactNode }) {
	const [state, setState] = useState<CookieState>({
		isAccepted: null,
		isRead: false,
		doNotShow: false,
		readCookie: () => {
			setState((prevState) => ({ ...prevState, isRead: true }));
			const bol = localStorage.getItem("analytics");
			if (bol === "true" || bol === "false") {
				setState((prevState) => ({
					...prevState,
					isAccepted: bol === "true",
					doNotShow: true,
				}));
			}
		},
		acceptCookie: () => {
			localStorage.setItem("analytics", "true");
			setState((prevState) => ({
				...prevState,
				isAccepted: true,
				isRead: true,
				doNotShow: true,
			}));
		},
		denyCookie: () => {
			localStorage.setItem("analytics", "false");
			setState((prevState) => ({
				...prevState,
				isAccepted: false,
				isRead: true,
				doNotShow: true,
			}));
		},
		toggleCookie: (accepted) => {
			localStorage.setItem("analytics", String(!accepted));
			setState((prevState) => ({
				...prevState,
				isAccepted: !accepted,
				isRead: true,
				doNotShow: true,
			}));
		},
	});

	useEffect(() => {
		if (!state.isRead) {
			state.readCookie();
		}
		if (state.isAccepted === false) {
			deleteAllCookies();
		}
	}, [state]);

	return (
		<CookieContextSchema.Provider value={state}>{props.children}</CookieContextSchema.Provider>
	);
}

export default CookieContext;
