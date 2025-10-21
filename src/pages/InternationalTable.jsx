import axios from "axios";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
	TextField,
	Box,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	CircularProgress,
	Typography,
	Grid,
	Button,
	Paper,
} from "@mui/material";
import { FaDownload } from "react-icons/fa";
import { CSVLink } from "react-csv";
import dayjs from "dayjs";

export const InternationalTable = () => {
	const [data, setData] = useState([]);
	const [apiData, setApiData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [loading, setLoading] = useState(true);
	const [tempStartDate, setTempStartDate] = useState(
		dayjs().startOf("day").format("YYYY-MM-DDTHH:mm")
	);
	const [tempEndDate, setTempEndDate] = useState(
		dayjs().endOf("day").format("YYYY-MM-DDTHH:mm")
	);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const getData = async () => {
		try {
			setLoading(true);
			const { data } = await axios.get(
				"https://messaging.approot.ng/internationaldata2.php"
			);
			const transformedData = Object.entries(data).map(([country, stats]) => ({
				country,
				nullCount: stats["null"],
				delivered: stats.DELIVRD,
				undelivered: stats.UNDELIV,
				totalMessages:
					Number(stats["null"]) + Number(stats.DELIVRD) + Number(stats.UNDELIV),
				deliveredPercentage:
					Number(stats.DELIVRD) === 0
						? 0
						: (
								(Number(stats.DELIVRD) /
									(Number(stats["null"]) +
										Number(stats.DELIVRD) +
										Number(stats.UNDELIV))) *
								100
						  ).toFixed(2),
			}));
			setData(transformedData);
			setApiData(transformedData);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setStartDate(tempStartDate);
		setEndDate(tempEndDate);
		const from = startDate.replace("T", " ") + ":00";
		const to = endDate.replace("T", " ") + ":59";

		let url = "";
		let queryParams = "";
		if (from && to) {
			url = "https://messaging.approot.ng/internationaltimedata2.php";
			queryParams = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
				to
			)}`;
		}

		try {
			setLoading(true);
			const { data } = await axios.get(url + queryParams);
			const transformedData = Object.entries(data).map(([country, stats]) => ({
				country,
				nullCount: stats["null"],
				delivered: stats.DELIVRD,
				undelivered: stats.UNDELIV,
				totalMessages:
					Number(stats["null"]) + Number(stats.DELIVRD) + Number(stats.UNDELIV),
				deliveredPercentage:
					Number(stats.DELIVRD) === 0
						? 0
						: Number(
								(Number(stats.DELIVRD) /
									(Number(stats["null"]) +
										Number(stats.DELIVRD) +
										Number(stats.UNDELIV))) *
									100
						  ).toFixed(2),
			}));
			setData(transformedData);
			setApiData(transformedData);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	const columns = [
		{ field: "country", headerName: "Country", width: 180 },
		{ field: "nullCount", headerName: "Pending", width: 150 },
		{ field: "delivered", headerName: "Delivered", width: 150 },
		{ field: "undelivered", headerName: "Undelivered", width: 150 },
		{ field: "totalMessages", headerName: "Total Messages", width: 170 },
		{
			field: "deliveredPercentage",
			headerName: "Delivered (%)",
			width: 170,
			type: "number",
		},
	];

	useEffect(() => {
		let filteredData = apiData;
		if (searchTerm !== "") {
			filteredData = filteredData.filter((item) =>
				item.country.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (filterStatus === "delivered") {
			filteredData = filteredData
				.filter((item) => item.delivered > 0)
				.sort((a, b) => b.delivered - a.delivered);
		} else if (filterStatus === "undelivered") {
			filteredData = filteredData
				.filter((item) => item.undelivered > 0)
				.sort((a, b) => b.undelivered - a.undelivered);
		} else if (filterStatus === "null") {
			filteredData = filteredData
				.filter((item) => item.nullCount > 0)
				.sort((a, b) => b.nullCount - a.nullCount);
		}
		setData(filteredData);
	}, [searchTerm, filterStatus, apiData]);

	useEffect(() => {
		getData();
	}, []);

	return (
		<Box p={3}>
			{/* Card Container */}
			<Paper
				elevation={4}
				sx={{
					p: 4,
					borderRadius: "20px",
					background: "#fff",
				}}
			>
				{/* Header */}
				<Typography
					variant='h4'
					gutterBottom
					sx={{ fontWeight: "bold", color: "#EF7D00" }}
				>
					🌍 International Message Delivery Report
				</Typography>
				<Typography variant='body1' color='textSecondary' mb={3}>
					Track delivery performance across different countries. Filter by date,
					country, or status.
				</Typography>

				{/* Filters */}
				<form onSubmit={handleSubmit}>
					<Grid container spacing={2} mb={2}>
						<Grid item xs={12} md={3}>
							<TextField
								label='Search Country'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								fullWidth
								disabled={loading}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth disabled={loading}>
								<InputLabel>Status</InputLabel>
								<Select
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value)}
								>
									<MenuItem value=''>All Status</MenuItem>
									<MenuItem value='delivered'>Delivered</MenuItem>
									<MenuItem value='undelivered'>Undelivered</MenuItem>
									<MenuItem value='null'>Pending</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={3}>
							<input
								type='datetime-local'
								value={tempStartDate}
								onChange={(e) => setTempStartDate(e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md'
							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<input
								type='datetime-local'
								value={tempEndDate}
								onChange={(e) => setTempEndDate(e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md'
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<Button
								variant='contained'
								type='submit'
								fullWidth
								sx={{
									backgroundColor: "#FFB84D",
									"&:hover": { backgroundColor: "#EF7D00" },
								}}
								disabled={loading}
							>
								Search
							</Button>
						</Grid>
						<Grid item xs={12} md={6}>
							{!loading && (
								<CSVLink
									data={data}
									filename={`International_Report_${new Date().toLocaleDateString()}.csv`}
									className='flex items-center justify-center px-4 py-2 rounded-md text-white'
									style={{
										backgroundColor: "#EF7D00",
										textDecoration: "none",
									}}
								>
									<FaDownload className='mr-2' /> Export CSV
								</CSVLink>
							)}
						</Grid>
					</Grid>
				</form>

				{/* Table */}
				<Box sx={{ height: 600, width: "100%" }}>
					{loading ? (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100%",
							}}
						>
							<CircularProgress />
						</Box>
					) : (
						<DataGrid
							rows={data}
							columns={columns}
							initialState={{
								pagination: {
									paginationModel: { pageSize: 10 },
								},
							}}
							pageSizeOptions={[10, 25, 50]}
							showToolbar
							disableSelectionOnClick
							getRowId={(row) => row.country}
							sx={{
								borderRadius: "12px",
								boxShadow: 2,
								"& .MuiDataGrid-columnHeaders": {
									backgroundColor: "#f24b32",
									color: "#fff",
									fontWeight: "bold",
								},
								"& .MuiDataGrid-row:hover": {
									backgroundColor: "#fce9e6",
								},
								"& .MuiDataGrid-columnHeaderTitle": {
									color: "#000",
									fontWeight: "bold",
								},
							}}
						/>
					)}
				</Box>
			</Paper>
		</Box>
	);
};
