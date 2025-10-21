import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { toast } from "react-toastify";

// Helper: convert country name to emoji flag
const getFlagEmoji = (countryCode) => {
	if (
		!countryCode ||
		typeof countryCode !== "string" ||
		countryCode.length < 2
	) {
		return "🏳️";
	}
	return String.fromCodePoint(
		...[...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt())
	);
};

const InternationalRates = () => {
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState([]);

	useEffect(() => {
		const fetchCountries = async () => {
			setLoading(true);
			try {
				const requestedFields = "name,cca2";
				const response = await axios.get(
					`https://restcountries.com/v3.1/all?fields=${requestedFields}`
				);

				const filtered = response.data
					.filter((country) => country.name?.common !== "Nigeria")
					.map((country, index) => ({
						id: index + 1,
						name: country.name?.common || "Unknown Country",
						flag: getFlagEmoji(country.cca2 || "UN"),
						rate: "₦160 / SMS",
					}));

				setRows(filtered.sort((a, b) => a.name.localeCompare(b.name)));
			} catch (err) {
				console.error("Error fetching country list:", err);
				toast.error("Failed to load country list");
			} finally {
				setLoading(false);
			}
		};

		fetchCountries();
	}, []);

	const columns = [
		{ field: "id", headerName: "#", width: 60 },
		{
			field: "flag",
			headerName: "Flag",
			width: 100,
			renderCell: (params) => (
				<span style={{ fontSize: "1.5rem" }}>{params.value}</span>
			),
		},
		{ field: "name", headerName: "Country", width: 200 },
		{
			field: "rate",
			headerName: "Rate",
			width: 150,
			cellClassName: "font-bold text-[#E3000F]", // primary for emphasis
		},
	];

	return (
		<Box className='p-6 text-[#636463]'>
			<Typography variant='h5' fontWeight='bold' color='#E3000F'>
				🌍 International SMS Rates
			</Typography>

			<Paper
				elevation={3}
				sx={{
					p: 4,
					mt: 3,
					border: "1px solid #636463", // neutral gray border
				}}
			>
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress sx={{ color: "#F68A8E" }} />{" "}
						{/* accent spinner */}
					</Box>
				) : (
					<DataGrid
						autoHeight
						rows={rows}
						columns={columns}
						getRowId={(row) => row.id}
						pageSizeOptions={[10, 25, 50]}
						initialState={{
							pagination: {
								paginationModel: { pageSize: 10 },
							},
						}}
						sx={{
							"& .MuiDataGrid-columnHeaders": {
								backgroundColor: "#F68A8E", // accent header
								color: "#7F070F", // dark text
								fontWeight: "bold",
							},
							"& .MuiDataGrid-row:hover": {
								backgroundColor: "#FDEBEC", // light tint of primary
							},
						}}
					/>
				)}
			</Paper>
		</Box>
	);
};

export default InternationalRates;
