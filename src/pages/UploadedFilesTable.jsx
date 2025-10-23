import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, CircularProgress, Typography, TextField } from "@mui/material";
import { FiInbox } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO, addDays } from "date-fns";
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

const UploadedFilesTable = () => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [filterDate, setFilterDate] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Endpoint for UploadedFilesTable (DataGrid View)
				const token = localStorage.getItem("access_token");
				const res = await axios.get(
					"https://accessbulk.approot.ng/upload.php",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				if (res.data.status && Array.isArray(res.data.data)) {
					const formatted = res.data.data.map((file) => {
						const totalCount = Number(file.total_count) || 0;
						const totalDistinct = Number(file.total_distinct) || 0;
						const count = Number(file.count) || 0;

						let statusText = "Unknown";
						// *** UPDATED STATUS LOGIC FOR DataGrid ***
						if (file.status === "4") {
							statusText = "Uploaded";
						} else if (file.status === "0" || file.status === "1") {
							statusText = "Processing";
						} else if (file.status === "2") {
							statusText = "Completed";
						} else if (file.status === "3" || file.status === "5") {
							statusText = "Failed";
						}

						return {
							id: file.id,
							...file,
							total_count: totalCount,
							total_distinct: totalDistinct,
							status: statusText,
							count: count > 0 ? count : 1,
							duplicates: Math.max(0, totalCount - totalDistinct),
						};
					});

					setRows(formatted);
				} else {
					setRows([]);
					console.warn(
						"API response status is not true or data is not an array:",
						res.data
					);
				}
			} catch (error) {
				console.error("Failed to fetch file data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// const filteredRows = rows.filter((row) =>
	// 	row.file_name?.toLowerCase().includes(searchText.toLowerCase())
	// );
	const filteredRows = rows.filter((row) => {
		const nameMatch = row.file_name
			?.toLowerCase()
			.includes(searchText.toLowerCase());

		if (!filterDate) return nameMatch;

		const rowDate = row.created_at ? parseISO(row.created_at) : null;

		// Match only if the date (ignoring time) is the same
		const isSameDate =
			rowDate &&
			filterDate &&
			rowDate.toDateString() === filterDate.toDateString();

		return nameMatch && isSameDate;
	});

	const handleRowClick = (params) => {
		const fileDetails = params.row;
		// Only navigate if the status is not "Processing"
		if (fileDetails.status !== "Processing") {
			navigate(`/dashboard/file-summary/${fileDetails.batch_id}`, {
				state: { file: fileDetails },
			});
		}
	};

	const columns = [
		{ field: "id", headerName: "ID", width: 70 },
		{ field: "file_name", headerName: "File Name", width: 200 },
		{ field: "batch_id", headerName: "Batch ID", width: 170 },
		{ field: "type", headerName: "Type", width: 100 },
		{ field: "msg_cat", headerName: "Category", width: 120 },
		{
			field: "total_count",
			headerName: "Total Count",
			width: 120,
			type: "number",
		},
		{
			field: "total_distinct",
			headerName: "Total Distinct",
			width: 130,
			type: "number",
		},
		{
			field: "duplicates",
			headerName: "Duplicates",
			width: 100,
			type: "number",
		},
		{ field: "count", headerName: "Amount Sent", width: 120, type: "number" },
		{
			field: "status",
			headerName: "Status",
			width: 120,
			// Custom render for DataGrid status cell to show colored text
			renderCell: (params) => {
				let style = {};
				if (params.value === "Completed") {
					style = { color: EXTRA_COLORS.successText, fontWeight: 600 };
				} else if (params.value === "Processing") {
					style = { color: BRAND.activeText, fontWeight: 600 };
				} else if (params.value === "Failed") {
					style = { color: STATUS_COLORS.errorText, fontWeight: 600 };
				} else if (params.value === "Uploaded") {
					style = { color: BRAND.activeBg, fontWeight: 600 };
				}
				return <span style={style}>{params.value}</span>;
			},
		},
		{ field: "cost_cntr", headerName: "Cost Center", width: 180 },
		{ field: "created_at", headerName: "Created At", width: 180 },
		{ field: "message", headerName: "Message", width: 250 },
		{ field: "schedule_time", headerName: "Scheduled At", width: 180 },
		{ field: "uploaded_by", headerName: "Uploaded By", width: 180 },
		{ field: "approved_by", headerName: "Approved By", width: 180 },
	];

	return (
		<Box sx={{ height: 600, width: "100%", padding: 2 }}>
			<Typography variant='h5' gutterBottom>
				Sent Message History
			</Typography>

			<TextField
				label='Search by File Name'
				variant='outlined'
				size='small'
				fullWidth
				margin='normal'
				value={searchText}
				onChange={(e) => setSearchText(e.target.value)}
				sx={{
					backgroundColor: EXTRA_COLORS.background.default,
					"& .MuiOutlinedInput-root": {
						color: EXTRA_COLORS.text.primary,
						borderColor: EXTRA_COLORS.border.light,
					},
				}}
			/>
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<Box sx={{ mb: 2, maxWidth: 250 }}>
					<DatePicker
						label='Filter by Date'
						value={filterDate}
						onChange={(newValue) => setFilterDate(newValue)}
						slotProps={{ textField: { size: "small", fullWidth: true } }}
						sx={{
							backgroundColor: EXTRA_COLORS.background.default,
							"& .MuiOutlinedInput-root": {
								color: EXTRA_COLORS.text.primary,
								borderColor: EXTRA_COLORS.border.light,
							},
						}}
					/>
				</Box>
			</LocalizationProvider>

			{loading ? (
				<Box className='flex items-center justify-center mt-16'>
					<CircularProgress />
				</Box>
			) : filteredRows.length === 0 ? (
				<Box
					sx={{ textAlign: "center", color: EXTRA_COLORS.text.muted, mt: 10 }}
				>
					<FiInbox size={48} style={{ marginBottom: 8 }} />
					<Typography variant='subtitle1'>No matching files found</Typography>
				</Box>
			) : (
				<DataGrid
					rows={filteredRows}
					columns={columns}
					pageSizeOptions={[10, 20, 50]}
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10 },
						},
						sorting: {
							sortModel: [{ field: "created_at", sort: "desc" }],
						},
					}}
					slots={{ toolbar: GridToolbar }}
					slotProps={{ toolbar: { showQuickFilter: true } }}
					showToolbar
					// Updated getRowClassName to use the new status strings
					getRowClassName={(params) => {
						switch (params.row.status) {
							case "Processing":
								return "row-processing";
							case "Completed":
								return "row-completed";
							case "Failed":
								return "row-failed";
							case "Uploaded":
								return "row-uploaded";
							default:
								return "";
						}
					}}
					onRowClick={handleRowClick}
					sx={{
						cursor: "pointer",
						"& .MuiDataGrid-row.row-processing": {
							backgroundColor: BRAND.hoverBg,
							color: "#fff",
						},
						"& .MuiDataGrid-row.row-completed": {
							backgroundColor: EXTRA_COLORS.successBg,
						},
						"& .MuiDataGrid-row.row-failed": {
							backgroundColor: STATUS_COLORS.errorBg,
						},
						"& .MuiDataGrid-row.row-uploaded": {
							backgroundColor: BRAND.activeBg,
							color: "#fff",
						},
						"& .MuiDataGrid-row:hover": {
							backgroundColor: BRAND.sidebarBg,
							color: "#fff",
						},
					}}
				/>
			)}
		</Box>
	);
};

export default UploadedFilesTable;
