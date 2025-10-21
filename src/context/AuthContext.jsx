// src/context/AuthContext.jsx
import React, {
	createContext,
	useState,
	useEffect,
	useRef,
	useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

const STORAGE_KEY = "zenith_token";
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(
		!!localStorage.getItem(STORAGE_KEY)
	);
	const [user, setUser] = useState(null);

	const inactivityTimerRef = useRef(null);
	const loginTimeRef = useRef(null);

	const getToken = () => localStorage.getItem(STORAGE_KEY);
	const getUserEmail = () => localStorage.getItem("zenith_emial") || "";

	const isSpecialUser = (() => {
		const email = getUserEmail().toLowerCase();
		return (
			email.includes("ais") ||
			email.includes("ems") ||
			email.includes("samson") ||
			email.includes("ade")
		);
	})();

	const saveToken = (token) => {
		localStorage.setItem(STORAGE_KEY, token);
		loginTimeRef.current = Date.now();
	};

	const login = (token, userData, role, email) => {
		saveToken(token);
		localStorage.setItem("xAI789", role);
		localStorage.setItem("zenith_emial", email);
		setIsAuthenticated(true);
		setUser(userData);
	};

	const logout = useCallback((msg) => {
		localStorage.clear();
		setIsAuthenticated(false);
		setUser(null);
		if (msg) toast.info(msg);
	}, []);

	const refreshToken = useCallback(async () => {
		const token = getToken();
		try {
			const response = await axios.post(
				"https://accessbulk.approot.ng/refresh_token.php",
				{ token },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const newToken = response.data?.token;

			if (newToken) {
				saveToken(newToken);
				loginTimeRef.current = Date.now();
			} else {
				logout("Session expired. Please log in again.");
			}
		} catch (err) {
			logout("Session expired. Please log in again.");
		}
	}, [logout]);

	const resetInactivityTimer = useCallback(() => {
		// ✅ AIS & EMS users: still reset inactivity timer
		if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

		if (getToken()) {
			inactivityTimerRef.current = setTimeout(() => {
				// Non-special users get logged out
				if (!isSpecialUser) {
					logout("You were logged out due to inactivity.");
				}
			}, INACTIVITY_TIMEOUT_MS);
		}
	}, [logout, isSpecialUser]);

	useEffect(() => {
		const token = getToken();
		if (!token) return;

		setIsAuthenticated(true);
		loginTimeRef.current = Date.now();

		if (!isSpecialUser) {
			// Only apply session timeout for non-AIS/EMS users
			const interval = setInterval(() => {
				const loginTime = loginTimeRef.current;
				if (loginTime && Date.now() - loginTime > SESSION_TIMEOUT_MS) {
					logout("Your session has expired. Please log in again.");
				} else {
					refreshToken();
				}
			}, 15 * 60 * 1000);

			return () => clearInterval(interval);
		}
	}, [refreshToken, logout, isSpecialUser]);

	useEffect(() => {
		if (!isAuthenticated) return;

		const events = [
			"mousemove",
			"mousedown",
			"keydown",
			"click",
			"scroll",
			"touchstart",
		];

		const handleActivity = () => resetInactivityTimer();

		events.forEach((e) => window.addEventListener(e, handleActivity));
		resetInactivityTimer();

		return () => {
			events.forEach((e) => window.removeEventListener(e, handleActivity));
			if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
		};
	}, [isAuthenticated, resetInactivityTimer]);

	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
