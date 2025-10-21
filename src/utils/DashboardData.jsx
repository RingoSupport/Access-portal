import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure to import axios
import { toast } from "react-toastify";

const useDashboardData = () => {
	const navigate = useNavigate();

	const fetchAllDashboardData = async () => {
		const token = localStorage.getItem("zenith_token");

		if (!token) {
			navigate("/login");
			throw new Error("No token found");
		}

		try {
			const [
				localTransactional,
				localOtp,
				localBulk,
				internationalTransactional,
				internationalOtp,
				internationalBulk,
			] = await Promise.all([
				axios.get("https://zenithsms.approot.ng/dashboard/dashboard.php", {
					headers: { Authorization: `Bearer ${token}` },
				}),
				axios.get("https://zenithsms.approot.ng/dashboard/otp/dashboard.php", {
					headers: { Authorization: `Bearer ${token}` },
				}),
				axios.get("https://zenithsms.approot.ng/dashboard/bulk/dashboard.php", {
					headers: { Authorization: `Bearer ${token}` },
				}),
				axios.get("https://messaging.approot.ng/dashboard2.php", {
					headers: { Authorization: `Bearer ${token}` },
				}),
				axios.get("https://messaging.approot.ng/otpdashboard2.php", {
					headers: { Authorization: `Bearer ${token}` },
				}),
				axios.get("https://messaging.approot.ng/otpdashboard2.php", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			]);

			return {
				localTransactional: {
					data: localTransactional.data.network_statistics || [],
					pendingTotal: localTransactional.data.pending_sms_remaining || 0,
				},
				localOtp: {
					data: localOtp.data.network_statistics || [],
					pendingTotal: localOtp.data.pending_sms_remaining || 0,
				},
				localBulk: {
					data: localBulk.data.network_statistics || [],
					pendingTotal: localBulk.data.pending_sms_remaining || 0,
				},
				internationalTransactional: internationalTransactional.data,
				internationalOtp: internationalOtp.data,
				internationalBulk: internationalBulk.data,
				lastUpdated: new Date().toLocaleString(),
			};
		} catch (error) {
			// Let TanStack Query handle the error
			throw error;
		}
	};
	return useQuery({
		queryKey: ["dashboardData"],
		queryFn: fetchAllDashboardData,
		refetchInterval: 10000, // 🔁 every 10 seconds
		// refetchInterval: 15000, // 🔁 every 15 seconds (use this instead if you prefer)
		staleTime: 5000, // data is fresh for 5 seconds
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
