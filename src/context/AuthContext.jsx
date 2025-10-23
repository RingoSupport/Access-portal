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
import { decryptData } from "../utils/crypto2";

export const AuthContext = createContext();

// 🔸 Access Bank configuration
const STORAGE_KEY = "access_token";
const ENCRYPTED_ROLE_KEY = "access_role";
const ENCRYPTED_EMAIL_KEY = "access_email";
const ALTERNATE_TOKEN_KEY = "access_alternate_token";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 min
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hrs

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(
		!!localStorage.getItem(STORAGE_KEY)
	);
	const [user, setUser] = useState(null);

	const inactivityTimerRef = useRef(null);
	const loginTimeRef = useRef(null);

	// 🔹 Token retrieval
	const getToken = () => localStorage.getItem(STORAGE_KEY);

	// 🔹 Email retrieval (decrypted if encrypted)
	const getUserEmail = () => {
		const encryptedEmail = localStorage.getItem(ENCRYPTED_EMAIL_KEY);
		if (!encryptedEmail) return "";
		try {
			return encryptedEmail;
		} catch (e) {
			console.error("Error decrypting email:", e);
			return "";
		}
	};

	// 🔹 Special user check
	const isSpecialUser = (() => {
		const email = getUserEmail().toLowerCase();
		return (
			email.includes("ais") ||
			email.includes("ems") ||
			email.includes("samson") ||
			email.includes("ade")
		);
	})();

	// 🔹 Save token + timestamp
	const saveToken = (token) => {
		localStorage.setItem(STORAGE_KEY, token);
		loginTimeRef.current = Date.now();
	};

	// 🔹 Login (with encrypted role/email)
	const login = (token, userData, encryptedRole, email) => {
		saveToken(token);
		localStorage.setItem(ENCRYPTED_ROLE_KEY, encryptedRole);
		localStorage.setItem(ENCRYPTED_EMAIL_KEY, email);
		setIsAuthenticated(true);
		setUser(userData);
	};

	// 🔹 Logout + cleanup
	const logout = useCallback((msg) => {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(ENCRYPTED_ROLE_KEY);
		localStorage.removeItem(ENCRYPTED_EMAIL_KEY);
		localStorage.removeItem(ALTERNATE_TOKEN_KEY);

		setIsAuthenticated(false);
		setUser(null);
		if (msg) toast.info(msg);
	}, []);

	// 🔹 Token refresh (Access-specific)
	const refreshToken = useCallback(async () => {
		const token = getToken();
		if (!token) return logout("Session expired. Please log in again.");
		try {
			const response = await axios.post(
				"https://accessbulk.approot.ng/refresh_token.php",
				{ token },
				{
					headers: { Authorization: `Bearer ${token}` },
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

	// 🔹 Inactivity timeout
	const resetInactivityTimer = useCallback(() => {
		if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

		if (getToken()) {
			inactivityTimerRef.current = setTimeout(() => {
				if (!isSpecialUser) logout("You were logged out due to inactivity.");
			}, INACTIVITY_TIMEOUT_MS);
		}
	}, [logout, isSpecialUser]);

	// 🔹 Session timeout & refresh
	useEffect(() => {
		const token = getToken();
		if (!token) return;

		setIsAuthenticated(true);
		loginTimeRef.current = Date.now();

		if (!isSpecialUser) {
			const interval = setInterval(() => {
				const loginTime = loginTimeRef.current;
				if (loginTime && Date.now() - loginTime > SESSION_TIMEOUT_MS) {
					logout("Your session has expired. Please log in again.");
				} else {
					refreshToken();
				}
			}, 15 * 60 * 1000); // every 15 min

			return () => clearInterval(interval);
		}
	}, [refreshToken, logout, isSpecialUser]);

	// 🔹 Activity listeners (mouse, keyboard, etc.)
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
		<AuthContext.Provider
			value={{ isAuthenticated, user, login, logout, getUserEmail }}
		>
			{children}
		</AuthContext.Provider>
	);
};
