import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	CircularProgress,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Search, FileDownload, Close } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Import colors from the palette file
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Define your API endpoint
const API_URL = "https://accessbulk.approot.ng/audit_logs.php";

export default function BulkAuditLogs() {
	const [auditLogs, setAuditLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [globalSearch, setGlobalSearch] = useState("");

	const [filterOpen, setFilterOpen] = useState(false);
	const [tempFromDate, setTempFromDate] = useState(null);
	const [tempToDate, setTempToDate] = useState(null);
	const [tempFullName, setTempFullName] = useState("");
	const [tempLogAction, setTempLogAction] = useState("");

	const [appliedFromDate, setAppliedFromDate] = useState(null);
	const [appliedToDate, setAppliedToDate] = useState(null);
	const [appliedFullName, setAppliedFullName] = useState("");
	const [appliedLogAction, setAppliedLogAction] = useState("");

	const fetchAuditLogs = useCallback(async () => {
		setLoading(true);
		setError(null);
		const token = localStorage.getItem("access_token");
		try {
			const response = await fetch(API_URL, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
				withCredentials: true,
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (!data.status) {
				toast.error(data.message);
			}
			setAuditLogs(data.data);
		} catch (err) {
			console.error("Error fetching audit logs:", err);
			setError(
				`Failed to load audit logs: ${err.message}. Please check API URL.`
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAuditLogs();
	}, [fetchAuditLogs]);

	const filteredLogs = auditLogs.filter((log) => {
		const matchesGlobalSearch = globalSearch
			? log.fullName.toLowerCase().includes(globalSearch.toLowerCase()) ||
			  log.logAction.toLowerCase().includes(globalSearch.toLowerCase())
			: true;

		const createdAt = dayjs(log.createdAt);
		const matchesDateRange =
			(!appliedFromDate ||
				createdAt.isSameOrAfter(dayjs(appliedFromDate), "day")) &&
			(!appliedToDate || createdAt.isSameOrBefore(dayjs(appliedToDate), "day"));

		const matchesFullName = appliedFullName
			? log.fullName.toLowerCase().includes(appliedFullName.toLowerCase())
			: true;

		const matchesLogAction = appliedLogAction
			? log.logAction.toLowerCase().includes(appliedLogAction.toLowerCase())
			: true;

		return (
			matchesGlobalSearch &&
			matchesDateRange &&
			matchesFullName &&
			matchesLogAction
		);
	});

	const columns = [
		{ field: "id", headerName: "ID", width: 90 },
		{ field: "fullName", headerName: "Full Name", width: 200 },
		{ field: "logAction", headerName: "Action", flex: 1, minWidth: 300 },
		{
			field: "createdAt",
			headerName: "Timestamp",
			width: 200,
			valueFormatter: (params) => {
				return params ? dayjs(params).format("YYYY-MM-DD HH:mm:ss") : "N/A";
			},
		},
	];

	const handleApplyFilter = () => {
		setAppliedFromDate(tempFromDate);
		setAppliedToDate(tempToDate);
		setAppliedFullName(tempFullName);
		setAppliedLogAction(tempLogAction);
		setFilterOpen(false);
	};

	const handleResetFilters = () => {
		setTempFromDate(null);
		setTempToDate(null);
		setTempFullName("");
		setTempLogAction("");
		setAppliedFromDate(null);
		setAppliedToDate(null);
		setAppliedFullName("");
		setAppliedLogAction("");
	};

	const handleExport = () => {
		alert("Export functionality not yet implemented.");
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box
				className='p-4 rounded-md shadow-sm'
				style={{ backgroundColor: EXTRA_COLORS.background.paper }}
			>
				<Typography
					variant='h5'
					sx={{ mb: 3, fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
				>
					Audit Logs
				</Typography>

				<Box className='flex flex-wrap items-center justify-between gap-3 mb-6'>
					<TextField
						placeholder='Search name or action'
						variant='outlined'
						size='small'
						value={globalSearch}
						onChange={(e) => setGlobalSearch(e.target.value)}
						sx={{ minWidth: "220px", flexGrow: 1 }}
						InputProps={{
							startAdornment: (
								<Search sx={{ mr: 1, color: EXTRA_COLORS.text.secondary }} />
							),
							sx: {
								borderRadius: "8px",
								paddingLeft: "8px",
								color: EXTRA_COLORS.text.primary,
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: EXTRA_COLORS.border.light,
								},
							},
						}}
					/>

					<Box className='flex items-center gap-3'>
						<Button
							variant='outlined'
							sx={{
								backgroundColor: EXTRA_COLORS.background.paper,
								color: EXTRA_COLORS.text.primary,
								borderColor: EXTRA_COLORS.border.light,
								"&:hover": {
									backgroundColor: EXTRA_COLORS.background.default,
									borderColor: EXTRA_COLORS.border.light,
								},
								textTransform: "none",
								borderRadius: "8px",
								minWidth: "80px",
								padding: "8px 16px",
							}}
							onClick={() => {
								setTempFromDate(appliedFromDate);
								setTempToDate(appliedToDate);
								setTempFullName(appliedFullName);
								setTempLogAction(appliedLogAction);
								setFilterOpen(true);
							}}
						>
							Filter
						</Button>
						<Button
							variant='contained'
							startIcon={<FileDownload />}
							sx={{
								backgroundColor: BRAND.activeBg,
								"&:hover": { backgroundColor: BRAND.hoverBg },
								color: EXTRA_COLORS.background.paper,
								textTransform: "none",
								borderRadius: "8px",
								minWidth: "80px",
								padding: "8px 16px",
							}}
							onClick={handleExport}
						>
							Export
						</Button>
					</Box>
				</Box>

				{loading && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress sx={{ color: BRAND.activeBg }} />
						<Typography
							variant='body1'
							sx={{ ml: 2, mt: 0.5, color: EXTRA_COLORS.text.primary }}
						>
							Loading audit logs...
						</Typography>
					</Box>
				)}

				{error && (
					<Alert
						severity='error'
						sx={{
							mb: 2,
							backgroundColor: STATUS_COLORS.errorBg,
							color: STATUS_COLORS.errorText,
						}}
					>
						{error}
					</Alert>
				)}

				{!loading && !error && (
					<Paper
						sx={{
							height: 600,
							width: "100%",
							boxShadow: "none",
							border: `1px solid ${EXTRA_COLORS.border.light}`,
							borderRadius: "8px",
						}}
					>
						<DataGrid
							rows={filteredLogs}
							columns={columns}
							pageSizeOptions={[10, 25, 50]}
							initialState={{
								pagination: {
									paginationModel: { pageSize: 10, page: 0 },
								},
							}}
							disableRowSelectionOnClick
							sx={{
								"& .MuiDataGrid-columnHeaderTitle": {
									color: EXTRA_COLORS.text.primary,
								},
								"& .MuiDataGrid-cell": {
									color: EXTRA_COLORS.text.secondary,
								},
								"& .MuiDataGrid-row:hover": {
									backgroundColor: EXTRA_COLORS.background.default,
								},
							}}
						/>
					</Paper>
				)}

				<Dialog
					open={filterOpen}
					onClose={() => setFilterOpen(false)}
					maxWidth='xs'
					fullWidth
					sx={{
						"& .MuiDialog-paper": {
							borderRadius: "12px",
							backgroundColor: EXTRA_COLORS.background.paper,
						},
					}}
				>
					<DialogTitle
						className='flex justify-between items-center'
						sx={{
							fontWeight: "600",
							fontSize: "1.1rem",
							pb: 1.5,
							pt: 2,
							px: 3,
							color: EXTRA_COLORS.text.primary,
						}}
					>
						<span>Filter by</span>
						<IconButton onClick={() => setFilterOpen(false)} sx={{ p: 0.5 }}>
							<Close sx={{ color: EXTRA_COLORS.text.secondary }} />
						</IconButton>
					</DialogTitle>
					<DialogContent
						dividers
						sx={{
							borderBottom: "none",
							px: 3,
							pt: 2,
							pb: 2,
							backgroundColor: EXTRA_COLORS.background.default,
						}}
						className='space-y-4'
					>
						<Typography
							variant='body2'
							sx={{ mb: 1, color: EXTRA_COLORS.text.secondary }}
						>
							Date
						</Typography>
						<Box className='grid grid-cols-2 gap-4'>
							<DatePicker
								label='From'
								value={tempFromDate}
								onChange={(val) => setTempFromDate(val)}
								slotProps={{ textField: { size: "small", fullWidth: true } }}
							/>
							<DatePicker
								label='To'
								value={tempToDate}
								onChange={(val) => setTempToDate(val)}
								slotProps={{ textField: { size: "small", fullWidth: true } }}
							/>
						</Box>
						<TextField
							label='Full Name'
							placeholder='Enter full name'
							variant='outlined'
							fullWidth
							size='small'
							value={tempFullName}
							onChange={(e) => setTempFullName(e.target.value)}
							InputProps={{
								endAdornment: tempFullName && (
									<Button
										onClick={() => setTempFullName("")}
										sx={{
											textTransform: "none",
											minWidth: "unset",
											p: 0.5,
											color: EXTRA_COLORS.text.muted,
										}}
									>
										Clear
									</Button>
								),
							}}
							sx={{
								"& .MuiInputBase-input": { color: EXTRA_COLORS.text.primary },
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: EXTRA_COLORS.border.light,
								},
							}}
						/>
						<TextField
							label='Log Action'
							placeholder='Enter log action'
							variant='outlined'
							fullWidth
							size='small'
							value={tempLogAction}
							onChange={(e) => setTempLogAction(e.target.value)}
							InputProps={{
								endAdornment: tempLogAction && (
									<Button
										onClick={() => setTempLogAction("")}
										sx={{
											textTransform: "none",
											minWidth: "unset",
											p: 0.5,
											color: EXTRA_COLORS.text.muted,
										}}
									>
										Clear
									</Button>
								),
							}}
							sx={{
								"& .MuiInputBase-input": { color: EXTRA_COLORS.text.primary },
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: EXTRA_COLORS.border.light,
								},
							}}
						/>
						<Box className='flex justify-between items-center pt-4'>
							<Button
								variant='outlined'
								sx={{
									textTransform: "none",
									borderRadius: "8px",
									borderColor: EXTRA_COLORS.border.light,
									color: EXTRA_COLORS.text.secondary,
								}}
								onClick={handleResetFilters}
							>
								Reset
							</Button>
							<Button
								variant='contained'
								sx={{
									backgroundColor: BRAND.activeBg,
									"&:hover": { backgroundColor: BRAND.hoverBg },
									color: EXTRA_COLORS.background.paper,
									textTransform: "none",
									borderRadius: "8px",
								}}
								onClick={handleApplyFilter}
							>
								Apply Filter
							</Button>
						</Box>
					</DialogContent>
				</Dialog>
			</Box>
		</LocalizationProvider>
	);
}
