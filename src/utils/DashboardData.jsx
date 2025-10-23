import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { decryptData } from "../utils/crypto2"; // 👈 CORRECTED NAMED IMPORT

// Storage key constants
const ALTERNATE_TOKEN_KEY = "access_alternate_token";
// Corrected key name based on our discussions:
const ENCRYPTED_EMAIL_KEY = "access_email";
// Note: The provided code used "zenith_email", but I assume you meant the encrypted one.

const useDashboardData = () => {
	const navigate = useNavigate();
	const fetchAllDashboardData = async () => {
		const alternateToken = localStorage.getItem(ALTERNATE_TOKEN_KEY);
		if (!alternateToken) {
			navigate("/login");
			throw new Error("No alternate token found");
		}

		const encryptedEmail = localStorage.getItem(ENCRYPTED_EMAIL_KEY);
		let userEmail = encryptedEmail;
		const headers = {
			Authorization: `Bearer ${alternateToken}`,
			Email: userEmail || "",
		};

		const requests = [
			axios.get("https://bulkaccess.approot.ng/dashboard/dashboard.php", {
				headers,
			}),
			axios.get("https://bulkaccess.approot.ng/dashboard/otp/dashboard.php", {
				headers,
			}),
			axios.get("https://bulkaccess.approot.ng/dashboard/bulk/dashboard.php", {
				headers,
			}),
			axios.get("https://messaging.approot.ng/dashboard2.php", {}),
			axios.get("https://messaging.approot.ng/otpdashboard2.php", {}),
			axios.get("https://messaging.approot.ng/otpdashboard2.php", {}),
		];

		const results = await Promise.allSettled(requests);

		// Helper function to extract safely
		const safeData = (result, defaultValue = {}) =>
			result.status === "fulfilled" ? result.value.data : defaultValue;

		return {
			localTransactional: {
				data: safeData(results[0]).network_statistics || [],
				pendingTotal: safeData(results[0]).pending_sms_remaining || 0,
			},
			localOtp: {
				data: safeData(results[1]).network_statistics || [],
				pendingTotal: safeData(results[1]).pending_sms_remaining || 0,
			},
			localBulk: {
				data: safeData(results[2]).network_statistics || [],
				pendingTotal: safeData(results[2]).pending_sms_remaining || 0,
			},
			internationalTransactional: safeData(results[3]),
			internationalOtp: safeData(results[4]),
			internationalBulk: safeData(results[5]),
			lastUpdated: new Date().toLocaleString(),
		};
	};

	return useQuery({
		queryKey: ["dashboardData"],
		queryFn: fetchAllDashboardData,
		refetchInterval: 60000,
		staleTime: 5000,
		gcTime: 300000,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		onError: (error) => {
			console.error("Dashboard data fetch error:", error);
			toast.error("Failed to load dashboard data");
		},
	});
};

export default useDashboardData;
