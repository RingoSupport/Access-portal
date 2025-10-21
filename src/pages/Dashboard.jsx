import { useState } from "react";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
} from "recharts";

// 🎨 Theme colors
import { EXTRA_COLORS, STATUS_COLORS } from "../theme/colors";
import useDashboardData from "../utils/DashboardData";

export default function Dashboard() {
	const [activeTab, setActiveTab] = useState("local-transactional");
	const { data: dashboardData } = useDashboardData();

	const getCurrentData = () => {
		if (!dashboardData) {
			return { type: "local", data: [], pendingTotal: 0 };
		}

		switch (activeTab) {
			case "local-transactional":
				return {
					type: "local",
					data: dashboardData.localTransactional.data,
					pendingTotal: dashboardData.localTransactional.pendingTotal,
				};
			case "local-otp":
				return {
					type: "local",
					data: dashboardData.localOtp.data,
					pendingTotal: dashboardData.localOtp.pendingTotal,
				};
			case "local-bulk":
				return {
					type: "local",
					data: dashboardData.localBulk.data,
					pendingTotal: dashboardData.localBulk.pendingTotal,
				};
			case "international-transactional":
				return {
					type: "international",
					data: dashboardData.internationalTransactional,
					pendingTotal: 0,
				};
			case "international-otp":
				return {
					type: "international",
					data: dashboardData.internationalOtp,
					pendingTotal: 0,
				};
			case "international-bulk":
				return {
					type: "international",
					data: dashboardData.internationalBulk,
					pendingTotal: 0,
				};
			default:
				return { type: "local", data: [], pendingTotal: 0 };
		}
	};

	const {
		type: currentType,
		data: currentData,
		pendingTotal: currentPendingTotal,
	} = getCurrentData();

	// Get last updated time from dashboardData
	const lastUpdated = dashboardData?.lastUpdated || null;

	// ---- Data Aggregation for Local SMS ----
	// ---- Local Stats ----
	const getLocalStats = (data, pendingTotal) => {
		const totalDelivered = data.reduce(
			(sum, i) => sum + parseInt(i.delivered || 0),
			0
		);
		const totalUndelivered = data.reduce(
			(sum, i) => sum + parseInt(i.undelivered || 0),
			0
		);
		const totalPending = data.reduce(
			(sum, i) => sum + parseInt(i.pending || 0),
			0
		);

		const totalExpired = data.reduce(
			(sum, i) => sum + parseInt(i.expired || 0),
			0
		);
		const totalRejected = data.reduce(
			(sum, i) => sum + parseInt(i.rejected || 0),
			0
		);
		const totalUnknown = data.reduce(
			(sum, i) => sum + parseInt(i.unknown || 0),
			0
		);

		return {
			totalDelivered,
			totalUndelivered,
			totalPending,
			totalExpired,
			totalRejected,
			totalUnknown,
			totalSMS:
				totalDelivered +
				totalUndelivered +
				totalPending +
				totalExpired +
				totalRejected +
				totalUnknown,
		};
	};

	// ---- International Stats ----
	const getInternationalStats = (data) => {
		if (!data)
			return {
				totalDelivered: 0,
				totalUndelivered: 0,
				totalPending: 0,
				totalExpired: 0,
				totalRejected: 0,
				totalUnknown: 0,
				totalSMS: 0,
			};

		return {
			totalDelivered: parseInt(data.delivered || 0),
			totalUndelivered: parseInt(data.undelivered || 0),
			totalPending: parseInt(data.pending || 0),
			totalExpired: parseInt(data.expired || 0),
			totalRejected: parseInt(data.rejected || 0),
			totalUnknown: parseInt(data.unknown || 0),
			totalSMS: parseInt(data.total_count || 0),
		};
	};

	const getStatusColor = (percentage, statusType) => {
		switch (statusType) {
			case "delivered":
				if (percentage >= 80) return " bg-green-300";
				if (percentage >= 50) return " bg-yellow-300";
				return " bg-red-300";

			case "undelivered":
			case "expired":
			case "rejected":
			case "unknown":
				if (percentage <= 5) return " bg-green-300";
				if (percentage <= 13) return " bg-yellow-300";
				return " bg-red-300";

			case "pending":
				if (percentage <= 15) return " bg-green-300";
				if (percentage <= 20) return " bg-yellow-300";
				return " bg-red-300";

			default:
				return "text-gray-600 bg-gray-50";
		}
	};

	const calculateRowStats = (row) => {
		const total =
			parseInt(row.delivered || 0) +
			parseInt(row.pending || 0) +
			parseInt(row.undelivered || 0) +
			parseInt(row.expired || 0) +
			parseInt(row.rejected || 0) +
			parseInt(row.unknown || 0);

		return {
			total,
			deliveredPct:
				total > 0
					? ((parseInt(row.delivered || 0) / total) * 100).toFixed(1)
					: "0.0",
			pendingPct:
				total > 0
					? ((parseInt(row.pending || 0) / total) * 100).toFixed(1)
					: "0.0",
			undeliveredPct:
				total > 0
					? ((parseInt(row.undelivered || 0) / total) * 100).toFixed(1)
					: "0.0",
			expiredPct:
				total > 0
					? ((parseInt(row.expired || 0) / total) * 100).toFixed(1)
					: "0.0",
			rejectedPct:
				total > 0
					? ((parseInt(row.rejected || 0) / total) * 100).toFixed(1)
					: "0.0",
			unknownPct:
				total > 0
					? ((parseInt(row.unknown || 0) / total) * 100).toFixed(1)
					: "0.0",
		};
	};

	// ---- Stats ----
	const stats =
		currentType === "local"
			? getLocalStats(currentData, currentPendingTotal)
			: getInternationalStats(currentData);

	const {
		totalDelivered,
		totalUndelivered,
		totalPending,
		totalExpired,
		totalRejected,
		totalUnknown,
		totalSMS,
	} = stats;

	// Calculate total failed messages (undelivered + expired + rejected + unknown)
	const totalFailed =
		totalUndelivered + totalExpired + totalRejected + totalUnknown;

	// ---- Pie Data ----
	const pieData = [
		{ name: "Delivered", value: totalDelivered },
		{ name: "Undelivered", value: totalUndelivered },
		{ name: "Pending", value: totalPending },
		{ name: "Expired", value: totalExpired },
		{ name: "Rejected", value: totalRejected },
		{ name: "Unknown", value: totalUnknown },
	];

	// ---- Colors (add enough to cover 6 slices) ----
	const PIE_COLORS = [
		EXTRA_COLORS.successText,
		STATUS_COLORS.errorText,
		"#FF9800", // Pending (orange)
		"#B91C1C", // Expired (dark red)
		"#DC2626", // Rejected (medium red)
		"#9CA3AF", // Unknown (neutral gray)
	];

	// Tab component
	const TabButton = ({ id, label, isActive, onClick }) => (
		<button
			onClick={() => onClick(id)}
			className={`px-4 py-2 font-medium text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
				isActive
					? "bg-[#7F070F] text-white shadow-md"
					: "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
			}`}
		>
			{label}
		</button>
	);

	// Get display name for active tab
	const getTabDisplayName = () => {
		switch (activeTab) {
			case "local-transactional":
				return "Local Transactional SMS";
			case "local-otp":
				return "Local OTP SMS";
			case "local-bulk":
				return "Local BULK SMS";
			case "international-transactional":
				return "International Transactional SMS";
			case "international-otp":
				return "International OTP SMS";
			case "international-bulk":
				return "International Bulk SMS";
			default:
				return "SMS";
		}
	};

	// if (loading) return <LoadingSpinner />;

	// ---- UI ----
	return (
		<div className='min-h-screen bg-gray-50 p-8 space-y-8'>
			{/* Header */}
			<div className='flex flex-col gap-4'>
				<div>
					<h1 className='text-3xl font-bold text-[#EF7D00]'>
						Acess Bank SMS Dashboard
					</h1>
					<p className='text-sm text-gray-500 mt-1'>
						Last updated:{" "}
						<span className='font-medium'>{lastUpdated || "Loading..."}</span>
					</p>
				</div>

				{/* Tab Navigation */}
				<div className='flex flex-wrap gap-2'>
					<div className='flex gap-2'>
						<span className='text-sm font-medium text-gray-700 py-2'>
							Local:
						</span>
						<TabButton
							id='local-transactional'
							label='📊 Transactional'
							isActive={activeTab === "local-transactional"}
							onClick={setActiveTab}
						/>
						<TabButton
							id='local-otp'
							label='🔐 OTP'
							isActive={activeTab === "local-otp"}
							onClick={setActiveTab}
						/>
						<TabButton
							id='local-bulk'
							label='📊 Bulk'
							isActive={activeTab === "local-bulk"}
							onClick={setActiveTab}
						/>
					</div>
					<div className='flex gap-2 ml-4'>
						<span className='text-sm font-medium text-gray-700 py-2'>
							International:
						</span>
						<TabButton
							id='international-transactional'
							label='🌍 Transactional'
							isActive={activeTab === "international-transactional"}
							onClick={setActiveTab}
						/>
						<TabButton
							id='international-otp'
							label='🌍 OTP'
							isActive={activeTab === "international-otp"}
							onClick={setActiveTab}
						/>
						<TabButton
							id='international-bulk'
							label='🌍 Bulk'
							isActive={activeTab === "international-bulk"}
							onClick={setActiveTab}
						/>
					</div>
				</div>
			</div>

			{/* Active Tab Indicator */}
			<div className='bg-white rounded-lg p-4 shadow-sm border-l-4 border-[#7F070F]'>
				<div className='flex items-center gap-2'>
					<div className='w-3 h-3 bg-[#7F070F] rounded-full animate-pulse'></div>
					<span className='font-medium text-gray-700'>
						Currently viewing: {getTabDisplayName()} Statistics
					</span>
				</div>
			</div>

			{/* Top Metric Cards */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
				<div className='rounded-xl shadow-md p-6 bg-white border-t-4 border-[#7F070F] hover:shadow-lg transition-shadow'>
					<p className='text-sm text-gray-500'>Total SMS</p>
					<p className='text-3xl font-bold text-gray-800'>
						{totalSMS + Number(currentPendingTotal)}
					</p>
					<p className='text-xs text-gray-400 mt-1'>
						{activeTab.includes("transactional") ? "Transactional" : "OTP"} •{" "}
						{activeTab.includes("international") ? "International" : "Local"}
					</p>
				</div>
				<div className='rounded-xl shadow-md p-6 bg-white border-t-4 border-green-600 hover:shadow-lg transition-shadow'>
					<p className='text-sm text-gray-500'>Delivered</p>
					<p className='text-3xl font-bold text-green-600'>{totalDelivered}</p>
					<p className='text-xs text-green-500 mt-1'>
						{totalSMS > 0
							? `${((totalDelivered / totalSMS) * 100).toFixed(1)}%`
							: "0%"}{" "}
						success rate
					</p>
				</div>
				<div className='rounded-xl shadow-md p-6 bg-white border-t-4 border-red-500 hover:shadow-lg transition-shadow'>
					<p className='text-sm text-gray-500'>Undelivered</p>
					<p className='text-3xl font-bold text-red-500'>{totalFailed}</p>
					<p className='text-xs text-red-500 mt-1'>
						{totalSMS > 0
							? `${((totalFailed / totalSMS) * 100).toFixed(1)}%`
							: "0%"}{" "}
						failed
					</p>
				</div>
				<div className='rounded-xl shadow-md p-6 bg-white border-t-4 border-yellow-500 hover:shadow-lg transition-shadow'>
					<p className='text-sm text-gray-500'>Awaiting DLR</p>
					<p className='text-3xl font-bold text-yellow-600'>{totalPending}</p>
					<p className='text-xs text-yellow-600 mt-1'>
						{totalSMS > 0
							? `${((totalPending / totalSMS) * 100).toFixed(1)}%`
							: "0%"}{" "}
						in queue
					</p>
				</div>
			</div>

			{/* Network Statistics Table - Only for Local SMS */}
			{currentType === "local" && (
				<div className='bg-white shadow-lg rounded-xl p-6 overflow-x-auto hover:shadow-xl transition-shadow'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-lg font-semibold text-[#7F070F] flex items-center gap-2'>
							📡 Network Statistics
							<span className='bg-[#7F070F] text-white text-xs px-2 py-1 rounded-full'>
								{activeTab.includes("bulk")
									? "Bulk SMS"
									: activeTab.includes("transactional")
									? "Transactional"
									: "OTP"}{" "}
								• Local
							</span>
						</h3>
						<div className='text-sm text-gray-500'>
							{currentData.length} networks
						</div>
					</div>

					{currentData.length === 0 ? (
						<div className='text-center py-8'>
							<div className='text-gray-400 text-4xl mb-2'>📊</div>
							<p className='text-gray-500'>
								No data available for {getTabDisplayName()}
							</p>
						</div>
					) : (
						<table className='min-w-full table-auto text-sm border-collapse'>
							<thead>
								<tr className='bg-gray-100 text-gray-600'>
									<th className='py-3 px-4 text-left rounded-tl-lg'>Network</th>
									<th className='py-3 px-4 text-center'>Delivered</th>
									<th className='py-3 px-4 text-center'>Pending</th>
									<th className='py-3 px-4 text-center'>Undelivered</th>
									<th className='py-3 px-4 text-center'>Expired</th>
									<th className='py-3 px-4 text-center'>Rejected</th>
									<th className='py-3 px-4 text-center'>Unknown</th>
									<th className='py-3 px-4 text-center rounded-tr-lg'>Pages</th>
								</tr>
							</thead>
							<tbody>
								{currentData.map((row, idx) => {
									const rowStats = calculateRowStats(row);
									return (
										<tr
											key={`${activeTab}-${row.id || idx}`}
											className={`${
												idx % 2 === 0 ? "bg-gray-50" : "bg-white"
											} hover:bg-blue-50 transition-colors`}
										>
											<td className='py-3 px-4 font-medium text-gray-700'>
												{row.network}
											</td>
											<td className='py-3 px-4 text-center'>
												<div
													className={` px-2 py-1 rounded text-xs font-medium ${getStatusColor(
														parseFloat(rowStats.deliveredPct),
														"delivered"
													)}`}
												>
													<div className='font-bold text-lg'>
														{row.delivered || 0}
													</div>
													<div className='text-[15px]'>
														{rowStats.deliveredPct}%
													</div>
												</div>
											</td>
											<td className='py-3 px-4 text-center'>
												<div
													className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
														parseFloat(rowStats.pendingPct),
														"pending"
													)}`}
												>
													<div className='font-bold text-lg'>
														{row.pending || 0}
													</div>
													<div className='text-[15px]'>
														{rowStats.pendingPct}%
													</div>
												</div>
											</td>
											<td className='py-3 px-4 text-center'>
												<div
													className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
														parseFloat(rowStats.undeliveredPct),
														"undelivered"
													)}`}
												>
													<div className='font-bold text-lg'>
														{row.undelivered || 0}
													</div>
													<div className='text-[15px]'>
														{rowStats.undeliveredPct}%
													</div>
												</div>
											</td>
											<td className='py-3 px-4 text-center'>
												<div
													className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
														parseFloat(rowStats.expiredPct),
														"expired"
													)}`}
												>
													<div className='font-bold text-lg'>
														{row.expired || 0}
													</div>
													<div className='text-[15px]'>
														{rowStats.expiredPct}%
													</div>
												</div>
											</td>
											<td className='py-3 px-4 text-center'>
												<div
													className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
														parseFloat(rowStats.rejectedPct),
														"rejected"
													)}`}
												>
													<div className='font-bold text-lg'>
														{row.rejected || 0}
													</div>
													<div className='text-[15px]'>
														{rowStats.rejectedPct}%
													</div>
												</div>
											</td>
											<td className='py-3 px-4 text-center'>
												<div
													className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
														parseFloat(rowStats.unknownPct),
														"unknown"
													)}`}
												>
													<div className='font-bold text-lg'>
														{row.unknown || 0}
													</div>
													<div className='text-[15px] text'>
														{rowStats.unknownPct}%
													</div>
												</div>
											</td>
											<td className='py-3 px-4 text-center text-gray-700 font-medium'>
												{row.pages || 0}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					)}
				</div>
			)}

			{/* International SMS Summary - Only for International SMS */}
			{currentType === "international" && (
				<div className='bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-lg font-semibold text-[#7F070F] flex items-center gap-2'>
							🌍 International SMS Summary
							<span className='bg-[#7F070F] text-white text-xs px-2 py-1 rounded-full'>
								{activeTab.includes("bulk")
									? "Bulk SMS"
									: activeTab.includes("transactional")
									? "Transactional"
									: "OTP"}{" "}
							</span>
						</h3>
					</div>

					{!currentData ? (
						<div className='text-center py-8'>
							<div className='text-gray-400 text-4xl mb-2'>🌍</div>
							<p className='text-gray-500'>
								No data available for {getTabDisplayName()}
							</p>
						</div>
					) : (
						<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
							<div className='text-center p-4 bg-green-50 rounded-lg border border-green-200'>
								<p className='text-sm text-green-700 font-medium'>Delivered</p>
								<p className='text-2xl font-bold text-green-600'>
									{currentData.delivered || 0}
								</p>
							</div>
							<div className='text-center p-4 bg-red-50 rounded-lg border border-red-200'>
								<p className='text-sm text-red-700 font-medium'>Undelivered</p>
								<p className='text-2xl font-bold text-red-600'>
									{currentData.undelivered || 0}
								</p>
							</div>
							<div className='text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
								<p className='text-sm text-yellow-700 font-medium'>Pending</p>
								<p className='text-2xl font-bold text-yellow-600'>
									{currentData.pending || 0}
								</p>
							</div>
							<div className='text-center p-4 bg-gray-50 rounded-lg border border-gray-200'>
								<p className='text-sm text-gray-700 font-medium'>Expired</p>
								<p className='text-2xl font-bold text-gray-600'>
									{currentData.expired || 0}
								</p>
							</div>
							<div className='text-center p-4 bg-gray-50 rounded-lg border border-gray-200'>
								<p className='text-sm text-gray-700 font-medium'>Rejected</p>
								<p className='text-2xl font-bold text-gray-600'>
									{currentData.rejected || 0}
								</p>
							</div>
							<div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
								<p className='text-sm text-blue-700 font-medium'>Total Count</p>
								<p className='text-2xl font-bold text-blue-600'>
									{currentData.total_count || 0}
								</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Charts */}
			<div className='grid md:grid-cols-2 gap-6'>
				{/* Pie Chart */}
				<div className='bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow'>
					<h3 className='text-lg font-semibold mb-4 text-[#7F070F] flex items-center gap-2'>
						📊 Delivery Breakdown
						<span className='text-sm font-normal text-gray-500'>
							{activeTab.includes("bulk")
								? "Bulk SMS"
								: activeTab.includes("transactional")
								? "Transactional"
								: "OTP"}{" "}
							•{" "}
							{activeTab.includes("international") ? "International" : "Local"})
						</span>
					</h3>
					{totalSMS === 0 ? (
						<div className='flex items-center justify-center h-[300px]'>
							<div className='text-center'>
								<div className='text-gray-300 text-6xl mb-4'>📊</div>
								<p className='text-gray-500'>No data to display</p>
							</div>
						</div>
					) : (
						<ResponsiveContainer width='100%' height={300}>
							<PieChart>
								<Pie
									data={pieData}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={100}
									label={({ name, percent }) =>
										percent > 0.05
											? `${name} ${(percent * 100).toFixed(0)}%`
											: ""
									}
								>
									{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={PIE_COLORS[index % PIE_COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip
									formatter={(value) => [value.toLocaleString(), ""]}
									labelStyle={{ color: "#7F070F" }}
								/>
							</PieChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Bar Chart - Only for Local SMS with network data */}
				<div className='bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow'>
					<h3 className='text-lg font-semibold mb-4 text-[#7F070F] flex items-center gap-2'>
						{currentType === "local"
							? "📱 Messages by Network"
							: "📊 Message Status"}
						<span className='text-sm font-normal text-gray-500'>
							{activeTab.includes("bulk")
								? "Bulk SMS"
								: activeTab.includes("transactional")
								? "Transactional"
								: "OTP"}{" "}
							•{" "}
							{activeTab.includes("international") ? "International" : "Local"})
						</span>
					</h3>
					{(currentType === "local" && currentData.length === 0) ||
					(currentType === "international" && !currentData) ? (
						<div className='flex items-center justify-center h-[300px]'>
							<div className='text-center'>
								<div className='text-gray-300 text-6xl mb-4'>
									{currentType === "local" ? "📱" : "📊"}
								</div>
								<p className='text-gray-500'>
									No {currentType === "local" ? "network" : ""} data available
								</p>
							</div>
						</div>
					) : (
						<ResponsiveContainer width='100%' height={300}>
							<BarChart
								data={
									currentType === "local"
										? currentData
										: [
												{
													name: "International SMS",
													delivered: currentData?.delivered || 0,
													undelivered: currentData?.undelivered || 0,
													pending: currentData?.pending || 0,
													expired: currentData?.expired || 0,
													rejected: currentData?.rejected || 0,
												},
										  ]
								}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey={currentType === "local" ? "network" : "name"} />
								<YAxis />
								<Tooltip
									formatter={(value) => [value.toLocaleString(), ""]}
									labelStyle={{ color: "#7F070F" }}
								/>
								<Legend />
								<Bar
									dataKey='delivered'
									fill={EXTRA_COLORS.successText}
									name='Delivered'
									radius={[2, 2, 0, 0]}
								/>
								<Bar
									dataKey='undelivered'
									fill={STATUS_COLORS.errorText}
									name='Undelivered'
									radius={[2, 2, 0, 0]}
								/>
								<Bar
									dataKey='pending'
									fill='#FF9800'
									name='Pending'
									radius={[2, 2, 0, 0]}
								/>
								{currentType === "international" && (
									<>
										<Bar
											dataKey='expired'
											fill='#9E9E9E'
											name='Expired'
											radius={[2, 2, 0, 0]}
										/>
										<Bar
											dataKey='rejected'
											fill='#795548'
											name='Rejected'
											radius={[2, 2, 0, 0]}
										/>
									</>
								)}
							</BarChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>

			{/* Summary Stats */}
			<div className='bg-white shadow-lg rounded-xl p-6'>
				<h3 className='text-lg font-semibold mb-4 text-[#7F070F]'>
					📈 Summary Statistics ({getTabDisplayName()})
				</h3>
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
					<div className='text-center p-4 bg-gray-50 rounded-lg'>
						<p className='text-sm text-gray-600'>Success Rate</p>
						<p className='text-xl font-bold text-green-600'>
							{totalSMS > 0
								? `${((totalDelivered / totalSMS) * 100).toFixed(1)}%`
								: "0%"}
						</p>
					</div>
					<div className='text-center p-4 bg-gray-50 rounded-lg'>
						<p className='text-sm text-gray-600'>Failure Rate</p>
						<p className='text-xl font-bold text-red-500'>
							{totalSMS > 0
								? `${((totalFailed / totalSMS) * 100).toFixed(1)}%`
								: "0%"}
						</p>
					</div>
					<div className='text-center p-4 bg-gray-50 rounded-lg'>
						<p className='text-sm text-gray-600'>
							{currentType === "local" ? "Active Networks" : "SMS Type"}
						</p>
						<p className='text-xl font-bold text-blue-600'>
							{currentType === "local" ? currentData.length : "International"}
						</p>
					</div>
					<div className='text-center p-4 bg-gray-50 rounded-lg'>
						<p className='text-sm text-gray-600'>
							{currentType === "local" ? "Avg per Network" : "Total Messages"}
						</p>
						<p className='text-xl font-bold text-purple-600'>
							{currentType === "local"
								? currentData.length > 0
									? Math.round(totalSMS / currentData.length)
									: 0
								: totalSMS}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
