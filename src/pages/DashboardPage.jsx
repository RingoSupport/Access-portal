import React, { useEffect, useState } from "react";
import axios from "axios";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import {
	FiMessageCircle,
	FiSmartphone,
	FiUsers,
	FiActivity,
} from "react-icons/fi";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const COLORS = {
	sidbarBg: "#E3000F", // Primary
	activeBg: "#F68A8E", // Accent
	hoverBg: "#7F070F", // Dark Shade
	activeText: "#636463", // Neutral Gray
	textColor: "#EF7D00",
};

const DashboardPage = () => {
	const [chartData, setChartData] = useState(false);
	const [loading, setLoading] = useState(true);
	const [queuesTotal, setQueuesTotal] = useState(0);
	const [messagesTotal, setMessagesTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [isFileProcessing, setIsFileProcessing] = useState(false);
	const [statusSummary, setStatusSummary] = useState({});

	const getStatusColor = (status, percentValue) => {
		if (status === "delivered") {
			if (percentValue > 80) return "bg-green-500";
			if (percentValue >= 50) return "bg-yellow-500";
			return "bg-red-500";
		}

		if (["undelivered", "expired", "rejected"].includes(status)) {
			if (percentValue <= 5) return "bg-green-500";
			if (percentValue <= 13) return "bg-yellow-500";
			return "bg-red-500";
		}

		if (status === "pending") {
			if (percentValue <= 15) return "bg-green-500";
			if (percentValue <= 20) return "bg-yellow-500";
			return "bg-red-500";
		}

		// fallback
		return "bg-gray-400";
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("https://accessbulk.approot.ng/portal.php");
				if (res.data?.status === "success") {
					setChartData(true);
					setQueuesTotal(res.data.totals?.queues || 0);
					setMessagesTotal(res.data.totals?.messages || 0);
					setTotalPages(res.data.totals?.pages || 0);
					setIsFileProcessing(res.data.loading === true);
					setStatusSummary(res.data.status_summary || {});
				} else {
					console.warn("Unexpected response format:", res.data);
				}
			} catch (error) {
				console.error("Failed to fetch messages data", error);
				if (error.response) {
					console.error("Server responded with:", error.response.data);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 4000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<h1
				className='text-4xl font-bold text-center mb-6'
				style={{ color: COLORS.textColor }}
			>
				Messaging Dashboard
			</h1>

			{loading ? (
				<p className='text-center text-gray-500'>Loading message data...</p>
			) : chartData ? (
				<>
					{isFileProcessing && (
						<div
							className='mb-6 border px-4 py-3 rounded-lg shadow animate-pulse text-center'
							style={{
								backgroundColor: COLORS.activeBg + "33", // light overlay
								borderColor: COLORS.activeBg,
								color: COLORS.sidbarBg,
							}}
						>
							<span className='font-semibold'>File upload in progress...</span>{" "}
							We're currently processing your uploaded file. Summary will update
							shortly.
						</div>
					)}

					{/* Summary Stats */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
						{[
							{
								icon: (
									<FiMessageCircle
										className='text-3xl'
										style={{ color: COLORS.activeBg }}
									/>
								),
								label: "Total Messages Processed",
								value: messagesTotal,
							},
							{
								icon: (
									<FiMessageCircle
										className='text-3xl'
										style={{ color: COLORS.sidbarBg }}
									/>
								),
								label: "Total SMS Pages",
								value: totalPages,
							},
							{
								icon: (
									<FiSmartphone
										className='text-3xl'
										style={{ color: COLORS.hoverBg }}
									/>
								),
								label: "Networks",
								value: 4,
							},
							{
								icon: (
									<FiUsers
										className='text-3xl'
										style={{ color: COLORS.activeText }}
									/>
								),
								label: "Total Items Pending",
								value: queuesTotal,
							},
							{
								icon: (
									<FiActivity
										className='text-3xl'
										style={{ color: COLORS.activeBg }}
									/>
								),
								label: "Today's Date",
								value: new Date().toDateString(),
							},
						].map((item, idx) => (
							<div
								key={idx}
								className='p-6 rounded-lg shadow flex items-center space-x-4'
								style={{ backgroundColor: "#fff" }}
							>
								{item.icon}
								<div>
									<p className='text-gray-600'>{item.label}</p>
									<h2
										className='text-xl font-bold'
										style={{ color: COLORS.sidbarBg }}
									>
										{item.value}
									</h2>
								</div>
							</div>
						))}
					</div>

					{/* Delivery Status Breakdown */}
					<div className='mb-12'>
						<h2
							className='text-3xl font-bold mb-6 border-b pb-2'
							style={{ color: COLORS.sidbarBg, borderColor: COLORS.activeBg }}
						>
							Delivery Status Summary by Network
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
							{Object.entries(statusSummary).map(([network, statuses]) => {
								const total = statuses.total || 0;
								const getPercent = (val) =>
									total ? `${Math.round((val / total) * 100)}%` : "0%";

								const statusColors = {
									delivered: "bg-green-500",
									pending: "bg-yellow-500",
									expired: "bg-gray-400",
									undelivered: "bg-red-500",
									rejected: "bg-pink-500",
									unknown: "bg-blue-500",
								};

								return (
									<div
										key={network}
										className='border rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300'
										style={{
											backgroundColor: "#fff",
											borderColor: "#f0f0f0",
										}}
									>
										<div className='mb-4'>
											<h3
												className='text-xl font-semibold'
												style={{ color: COLORS.sidbarBg }}
											>
												{network}
											</h3>
											<p className='text-sm text-gray-500'>
												Total: <span className='font-medium'>{total}</span>{" "}
												messages
											</p>
										</div>

										<div className='space-y-3'>
											{Object.entries(statuses)
												.filter(([key]) => key !== "total")
												.map(([status, count]) => {
													const percent = getPercent(count);
													return (
														<div key={status}>
															<div className='flex justify-between text-sm text-gray-600 mb-1'>
																<span className='capitalize'>{status}</span>
																<span className='font-semibold text-gray-700'>
																	{count} ({percent})
																</span>
															</div>
															<div className='relative w-full bg-gray-200 h-2 rounded overflow-hidden'>
																<div
																	className={`${
																		statusColors[status] || "bg-gray-300"
																	} h-2 rounded transition-all duration-500`}
																	style={{ width: percent }}
																></div>
															</div>
														</div>
													);
												})}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</>
			) : (
				<p className='text-center text-gray-600'>
					No messages found for today.
				</p>
			)}
		</div>
	);
};

export default DashboardPage;
