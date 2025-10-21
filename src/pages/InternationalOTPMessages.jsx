import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import { FaDownload, FaSearch } from "react-icons/fa";
import { CSVLink } from "react-csv";
import { findCountryByPhoneNumber } from "../utils/international";
import { getOperator } from "../utils/checkInternational";
import { BRAND, EXTRA_COLORS } from "../theme/colors";

export const InternationalOTPMessages = () => {
	const [initialData, setInitialData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filterValue, setFilterValue] = useState("");
	const [downloadButton, setDownloadButton] = useState(false);

	const filterTable = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const { data } = await axios.get(
				`https://messaging.approot.ng/internationalOTPSearch2.php?phone=${filterValue}`
			);
			setInitialData(
				data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
			);
			setLoading(false);
			setDownloadButton(true);
		} catch (error) {
			setLoading(false);
		}
	};

	const transformDataForCSV = (data) => {
		return data.map((row) => ({
			msisdn: "'" + row.phone,
			senderid: row.sender_id || "UBA",
			created_at: row.created_at,
			status: getDlrStatusDescription(row.status),
			externalMessageId: window.crypto.randomUUID(),
			requestType: "OTP",
		}));
	};

	const getDlrStatusDescription = (status) => {
		if (!status) return "Pending";
		if (status === "DELIVRD") return "Delivered";
		if (status === "EXPIRD") return "Expired";
		if (status === "UNDELIV") return "Undelivered";
		if (status === "REJECTED") return "Rejected";
		return "Sent";
	};

	const newColumns = [
		{ field: "id", headerName: "ID", width: 90 },
		{ field: "message_request_id", headerName: "Message Id", width: 130 },
		{ field: "messages", headerName: "Message", width: 160 },
		{ field: "phone", headerName: "Recipient", width: 160 },
		{ field: "sender_id", headerName: "Sender Id", width: 160 },
		{
			field: "Country",
			headerName: "Country",
			width: 180,
			renderCell: (params) =>
				params.row.phone ? findCountryByPhoneNumber(params.row.phone) : "N/A",
		},
		{
			field: "Operator",
			headerName: "Operator",
			width: 180,
			renderCell: (params) =>
				params.row.phone ? getOperator(params.row.phone) : "N/A",
		},
		{ field: "created_at", headerName: "Date Time", width: 200 },
		{ field: "updated_at", headerName: "Delivery Time", width: 200 },
		{
			field: "status",
			headerName: "Status",
			width: 130,
			renderCell: (params) => {
				const value = params.value;
				const base = "px-2 py-1 rounded text-xs font-medium";
				if (!value)
					return (
						<span className={`${base} bg-yellow-100 text-yellow-700`}>
							Pending
						</span>
					);
				if (value === "DELIVRD")
					return (
						<span className={`${base} bg-green-100 text-green-700`}>
							Delivered
						</span>
					);
				if (value === "EXPIRD")
					return (
						<span className={`${base} bg-gray-200 text-gray-700`}>Expired</span>
					);
				if (value === "UNDELIV")
					return (
						<span className={`${base} bg-red-100 text-red-600`}>
							Undelivered
						</span>
					);
				if (value === "REJECTED")
					return (
						<span className={`${base} bg-red-200 text-red-700`}>Rejected</span>
					);
				return (
					<span className={`${base} bg-blue-100 text-blue-700`}>Sent</span>
				);
			},
		},
	];

	const getItems = async () => {
		setLoading(true);
		try {
			const { data } = await axios.get(
				"https://messaging.approot.ng/internationalotp2.php"
			);
			setInitialData(
				data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
			);
			setLoading(false);
		} catch (error) {
			setLoading(false);
		}
	};

	useEffect(() => {
		getItems();
	}, []);

	return (
		<div className='min-h-screen bg-gray-50 p-6'>
			{loading ? (
				<div className='flex justify-center items-center h-screen'>
					<FadeLoader color={BRAND.activeBg} loading={loading} />
				</div>
			) : (
				<div className='bg-white rounded-2xl shadow-md p-6'>
					<div className='flex justify-between items-center border-b pb-3 mb-4'>
						<h1 className='text-xl font-bold text-[${BRAND.activeBg}]'>
							🔑 International OTP Logs
						</h1>
						{downloadButton && (
							<CSVLink
								data={transformDataForCSV(initialData)}
								filename={`International_OTP_${new Date().toLocaleDateString()}.csv`}
								className='flex items-center px-4 py-2 bg-[${BRAND.activeBg}] text-white rounded-md hover:bg-[${BRAND.hoverBg}] transition duration-300'
							>
								<FaDownload className='mr-2' /> Export
							</CSVLink>
						)}
					</div>

					{/* Filter form */}
					<form onSubmit={filterTable} className='flex items-center gap-2 mb-4'>
						<input
							type='search'
							placeholder='🔍 Search Phone Number'
							className='w-64 border border-gray-300 text-sm p-2 rounded-md focus:ring-2 focus:ring-[${BRAND.activeBg}]'
							value={filterValue}
							required
							onChange={(e) => setFilterValue(e.target.value)}
						/>
						<button
							type='submit'
							className='flex items-center px-4 py-2 bg-[${BRAND.activeBg}] text-white text-sm rounded-md hover:bg-[${BRAND.hoverBg}] transition'
						>
							<FaSearch className='mr-1' /> Filter
						</button>
					</form>

					{/* Data Grid */}
					<div className='w-full h-[600px]'>
						<DataGrid
							rows={initialData.map((item, index) => ({
								id: index + 1,
								...item,
							}))}
							rowHeight={60}
							columns={newColumns}
							initialState={{
								pagination: {
									paginationModel: { pageSize: 10 },
								},
							}}
							pageSizeOptions={[10, 25, 50]}
							showToolbar
							sx={{
								border: "1px solid #E5E7EB",
								"& .MuiDataGrid-columnHeaders": {
									backgroundColor: "#000",
									color: "white",
									fontWeight: "bold",
								},
								"& .MuiDataGrid-cell": {
									borderColor: EXTRA_COLORS.border.light,
								},
								"& .MuiDataGrid-columnHeaderTitle": {
									color: "#000",
									fontWeight: "bold",
								},
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
