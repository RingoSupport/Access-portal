import React, { useState, useEffect, useMemo } from "react";
import {
	Tabs,
	Tab,
	TextField,
	Button,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	Box,
	Dialog,
	DialogTitle,
	DialogContent,
	MenuItem,
	IconButton,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { Search, ExpandMore, FileDownload, Close } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Import colors from the palette file
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const getAmount = (network, sms) => {
	switch (network) {
		case "MTN":
		case "GLO":
		case "AIRTEL":
			return sms * 4.9;
		case "9MOBILE":
			return sms * 2.7;
		case "INTERNATIONAL":
			return sms * 16.0;
		default:
			return 0;
	}
};

export default function SummaryDashboard() {
	const [tab, setTab] = useState(0);
	const [searchCostCentre, setSearchCostCentre] = useState("");
	const [data, setData] = useState([]); // Initial state is an empty array
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filterOpen, setFilterOpen] = useState(false);
	const [tempFromDate, setTempFromDate] = useState(null);
	const [tempToDate, setTempToDate] = useState(null);
	const [tempCostCenter, setTempCostCenter] = useState("");
	const [tempCategory, setTempCategory] = useState("");
	const [tempSenderId, setTempSenderId] = useState("");

	const [appliedFromDate, setAppliedFromDate] = useState(null);
	const [appliedToDate, setAppliedToDate] = useState(null);
	const [appliedCostCenter, setAppliedCostCenter] = useState("");
	const [appliedCategory, setAppliedCategory] = useState("");
	const [appliedSenderId, setAppliedSenderId] = useState("");

	const allCategories = useMemo(() => {
		return Array.isArray(data)
			? Array.from(new Set(data.map((item) => item.category)))
			: [];
	}, [data]);

	const allSenderIds = useMemo(() => {
		return Array.isArray(data)
			? Array.from(new Set(data.map((item) => item.senderId)))
			: [];
	}, [data]);

	const allCostCenters = useMemo(() => {
		return Array.isArray(data)
			? Array.from(new Set(data.map((item) => item.costCenter))).filter(Boolean)
			: [];
	}, [data]);

	useEffect(() => {
		async function fetchData() {
			const token = localStorage.getItem("zenith_token");
			try {
				const response = await fetch(
					"https://accessbulk.approot.ng/get_summary.php",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const result = await response.json();
				if (Array.isArray(result)) {
					setData(result);
				} else {
					console.error("API response was not an array:", result);
					setError(
						"Failed to load data. The data received was in an unexpected format."
					);
					setData([]);
				}
			} catch (err) {
				console.error("Error fetching data:", err);
				setError("Network error. Please check your connection and try again.");
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const filteredData = useMemo(() => {
		if (!Array.isArray(data)) {
			return [];
		}

		let filtered = data;

		if (searchCostCentre) {
			filtered = filtered.filter((item) =>
				item.costCenter.toLowerCase().includes(searchCostCentre.toLowerCase())
			);
		}

		if (appliedFromDate && appliedToDate) {
			filtered = filtered.filter((item) => {
				const itemDate = dayjs(item.date);
				return (
					itemDate.isAfter(dayjs(appliedFromDate).subtract(1, "day")) &&
					itemDate.isBefore(dayjs(appliedToDate).add(1, "day"))
				);
			});
		} else if (appliedFromDate) {
			filtered = filtered.filter((item) =>
				dayjs(item.date).isSameOrAfter(dayjs(appliedFromDate), "day")
			);
		} else if (appliedToDate) {
			filtered = filtered.filter((item) =>
				dayjs(item.date).isSameOrBefore(dayjs(appliedToDate), "day")
			);
		}

		if (appliedCostCenter) {
			filtered = filtered.filter((item) =>
				item.costCenter.toLowerCase().includes(appliedCostCenter.toLowerCase())
			);
		}

		if (appliedCategory) {
			filtered = filtered.filter((item) => item.category === appliedCategory);
		}

		if (appliedSenderId) {
			filtered = filtered.filter((item) => item.senderId === appliedSenderId);
		}

		if (tab === 1) {
			filtered = filtered
				.map((item) => ({
					...item,
					networks: item.networks.filter((n) => n.name === "INTERNATIONAL"),
				}))
				.filter((item) => item.networks.length > 0);
		}

		return filtered;
	}, [
		data,
		searchCostCentre,
		appliedFromDate,
		appliedToDate,
		appliedCostCenter,
		appliedCategory,
		appliedSenderId,
		tab,
	]);

	const handleApplyFilter = () => {
		setAppliedFromDate(tempFromDate);
		setAppliedToDate(tempToDate);
		setAppliedCostCenter(tempCostCenter);
		setTempCategory(tempCategory);
		setTempSenderId(tempSenderId);
		setFilterOpen(false);
	};

	const handleResetFilters = () => {
		setTempFromDate(null);
		setTempToDate(null);
		setTempCostCenter("");
		setTempCategory("");
		setTempSenderId("");
	};

	const exportToExcel = (data) => {
		if (!Array.isArray(data)) {
			console.error("Cannot export, data is not an array.");
			return;
		}

		const rows = [];
		let grandTotal = 0;

		data.forEach((item) => {
			const narration = "SMS ALERT MONTHLY VENDOR PAYMENT A/C";

			item.networks.forEach((net) => {
				const amount = getAmount(net.name, net.sms);
				grandTotal += amount;

				rows.push({
					Costcode: item.costCenter,
					Category: item.category || "",
					Network: net.name,
					Sms_Count: net.sms,
					Narration: narration,
					Amount: amount,
					Currency: "NGN",
				});
			});
		});

		rows.push({});
		rows.push({
			Costcode: "",
			Narration: "TOTAL",
			Amount: grandTotal,
			Currency: "NGN",
		});

		const worksheet = XLSX.utils.json_to_sheet(rows);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "SMS Summary");

		const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
		saveAs(
			new Blob([wbout], { type: "application/octet-stream" }),
			"sms_summary.xlsx"
		);
	};

	if (loading) return <Typography>Loading summary data...</Typography>;

	// Updated error display using Material-UI Alert component
	if (error) {
		return (
			<MuiAlert
				severity='error'
				sx={{
					width: "100%",
					mb: 2,
					borderRadius: "8px",
					backgroundColor: STATUS_COLORS.errorBackground,
					color: STATUS_COLORS.errorText,
					"& .MuiAlert-icon": {
						color: STATUS_COLORS.errorText,
					},
				}}
			>
				<AlertTitle sx={{ fontWeight: "bold" }}>Error</AlertTitle>
				{error}
			</MuiAlert>
		);
	}

	return (
		<div
			className='p-4 rounded-md shadow-sm'
			style={{ backgroundColor: EXTRA_COLORS.background.paper }}
		>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<Tabs
					value={tab}
					onChange={(_, val) => setTab(val)}
					className='mb-4'
					sx={{
						"& .MuiTabs-indicator": {
							backgroundColor: BRAND.activeBg,
							height: "3px",
						},
					}}
				>
					<Tab
						label='Summary'
						sx={{
							color: tab === 0 ? BRAND.activeText : EXTRA_COLORS.text.secondary,
							fontWeight: tab === 0 ? "600" : "normal",
							textTransform: "none",
							fontSize: "0.9rem",
							minWidth: "unset",
							padding: "6px 12px",
						}}
					/>
					<Tab
						label='International'
						sx={{
							color: tab === 1 ? BRAND.activeText : EXTRA_COLORS.text.secondary,
							fontWeight: tab === 1 ? "600" : "normal",
							textTransform: "none",
							fontSize: "0.9rem",
							minWidth: "unset",
							padding: "6px 12px",
						}}
					/>
				</Tabs>

				<Box className='flex flex-wrap items-center justify-between gap-3 mb-6'>
					<TextField
						placeholder='Search cost centre'
						variant='outlined'
						size='small'
						value={searchCostCentre}
						onChange={(e) => setSearchCostCentre(e.target.value)}
						sx={{ minWidth: "220px", flexGrow: 1 }}
						InputProps={{
							startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
							sx: {
								borderRadius: "8px",
								paddingLeft: "8px",
								backgroundColor: EXTRA_COLORS.background.paper,
								color: EXTRA_COLORS.text.primary,
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
								setTempCostCenter(appliedCostCenter);
								setTempCategory(appliedCategory);
								setTempSenderId(appliedSenderId);
								setFilterOpen(true);
							}}
						>
							Filter
						</Button>
						<Button
							variant='contained'
							startIcon={<FileDownload />}
							onClick={() => exportToExcel(filteredData)}
							sx={{
								backgroundColor: BRAND.activeBg,
								"&:hover": { backgroundColor: BRAND.hoverBg },
								color: EXTRA_COLORS.background.paper,
								textTransform: "none",
								borderRadius: "8px",
								minWidth: "80px",
								padding: "8px 16px",
							}}
						>
							Export
						</Button>
					</Box>
				</Box>

				<Box
					className='flex justify-between w-full mb-3 py-2 px-4 border-b'
					sx={{ borderColor: EXTRA_COLORS.border.light }}
				>
					<Typography
						variant='subtitle2'
						sx={{
							width: "33%",
							fontWeight: "600",
							color: EXTRA_COLORS.text.primary,
						}}
					>
						Date
					</Typography>
					<Typography
						variant='subtitle2'
						sx={{
							width: "33%",
							textAlign: "center",
							fontWeight: "600",
							color: EXTRA_COLORS.text.primary,
						}}
					>
						Total SMS sent
					</Typography>
					<Typography
						variant='subtitle2'
						sx={{
							width: "33%",
							textAlign: "right",
							fontWeight: "600",
							color: EXTRA_COLORS.text.primary,
						}}
					>
						Amount
					</Typography>
				</Box>

				<div className='space-y-3'>
					{Array.isArray(filteredData) && filteredData.length > 0 ? (
						filteredData.map((item, idx) => {
							const totalSms = item.networks.reduce((acc, n) => acc + n.sms, 0);
							const totalAmount = item.networks.reduce(
								(acc, n) => acc + getAmount(n.name, n.sms),
								0
							);

							if (tab === 1 && totalSms === 0) {
								return null;
							}

							return (
								<Accordion
									key={idx}
									defaultExpanded={idx === 0}
									sx={{
										boxShadow: "none",
										border: `1px solid ${EXTRA_COLORS.border.light}`,
										borderRadius: "8px",
										overflow: "hidden",
										"&:not(:last-child)": {
											marginBottom: "8px",
										},
										"&.Mui-expanded": {
											margin: "8px 0",
										},
										"& .MuiAccordionSummary-root": {
											padding: "12px 16px",
											minHeight: "48px",
										},
										"& .MuiAccordionDetails-root": {
											padding: "8px 16px 16px",
										},
									}}
								>
									<AccordionSummary
										expandIcon={<ExpandMore sx={{ color: BRAND.activeBg }} />}
										sx={{ flexDirection: "row-reverse" }}
									>
										<Box className='flex justify-between items-center w-full'>
											<Typography
												variant='body1'
												sx={{
													width: "33%",
													fontWeight: "500",
													color: EXTRA_COLORS.text.primary,
												}}
											>
												{dayjs(item.date).format("MMMM D, YYYY")}
											</Typography>
											<Typography
												variant='body1'
												sx={{
													width: "33%",
													textAlign: "center",
													color: EXTRA_COLORS.text.primary,
												}}
											>
												{totalSms.toLocaleString()}
											</Typography>
											<Typography
												variant='body1'
												sx={{
													width: "33%",
													textAlign: "right",
													fontWeight: "500",
													color: EXTRA_COLORS.text.primary,
												}}
											>
												₦
												{totalAmount.toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</Typography>
										</Box>
									</AccordionSummary>
									{item.networks.length > 0 && (
										<AccordionDetails>
											<div
												className='space-y-1 ml-4 pl-4'
												style={{
													borderLeft: `1px solid ${EXTRA_COLORS.border.light}`,
												}}
											>
												{item.networks.map((n, subIdx) => (
													<Box
														key={subIdx}
														className='flex justify-between text-sm py-1'
														sx={{ color: EXTRA_COLORS.text.secondary }}
													>
														<Typography variant='body2' sx={{ width: "33%" }}>
															{n.name}
														</Typography>
														<Typography
															variant='body2'
															sx={{ width: "33%", textAlign: "center" }}
														>
															{n.sms.toLocaleString()}
														</Typography>
														<Typography
															variant='body2'
															sx={{ width: "33%", textAlign: "right" }}
														>
															₦
															{getAmount(n.name, n.sms).toLocaleString(
																undefined,
																{
																	minimumFractionDigits: 2,
																	maximumFractionDigits: 2,
																}
															)}
														</Typography>
													</Box>
												))}
											</div>
										</AccordionDetails>
									)}
								</Accordion>
							);
						})
					) : (
						<Typography
							variant='body1'
							sx={{
								textAlign: "center",
								mt: 4,
								color: EXTRA_COLORS.text.secondary,
							}}
						>
							No data available for the selected filters.
						</Typography>
					)}
				</div>

				<Dialog
					open={filterOpen}
					onClose={() => setFilterOpen(false)}
					maxWidth='xs'
					fullWidth
					sx={{ "& .MuiDialog-paper": { borderRadius: "12px" } }}
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
							<Close sx={{ color: EXTRA_COLORS.text.primary }} />
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
							select
							label='Cost Center'
							fullWidth
							size='small'
							value={tempCostCenter}
							onChange={(e) => setTempCostCenter(e.target.value)}
						>
							<MenuItem value=''>All</MenuItem>
							{allCostCenters.map((cc) => (
								<MenuItem key={cc} value={cc}>
									{cc}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label='Category'
							fullWidth
							size='small'
							value={tempCategory}
							onChange={(e) => setTempCategory(e.target.value)}
						>
							<MenuItem value=''>All</MenuItem>
							{allCategories.map((cat) => (
								<MenuItem key={cat} value={cat}>
									{cat}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label='Sender Id'
							fullWidth
							size='small'
							value={tempSenderId}
							onChange={(e) => setTempSenderId(e.target.value)}
						>
							<MenuItem value=''>All</MenuItem>
							{allSenderIds.map((sid) => (
								<MenuItem key={sid} value={sid}>
									{sid}
								</MenuItem>
							))}
						</TextField>
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
			</LocalizationProvider>
		</div>
	);
}
