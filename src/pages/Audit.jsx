import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Paper, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import LoadingSpinner from "../components/Loading";
import { toast } from "react-toastify";

const AuditLogs = () => {
	const [fullname, setFullname] = useState("");
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(false);

	const token = localStorage.getItem("zenith_token");

	const fetchAuditLogs = async (filter = "") => {
		setLoading(true);
		try {
			const response = await axios.get(
				`https://accessbulk.approot.ng/audit_logs.php${filter}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (response.data.status && response.data.data.length > 0) {
				// API returns objects with {id, fullName, logAction, userId, createdAt}
				setLogs(response.data.data);
			} else {
				toast.info("No audit logs found.");
				setLogs([]);
			}
		} catch (err) {
			console.error("Failed to fetch audit logs", err);
			toast.error("Failed to load audit logs.");
			setLogs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuditLogs();
	}, []);

	const handleSearch = (e) => {
		e.preventDefault();
		const name = fullname.trim();
		if (!name) {
			toast.error("Please enter a full name");
			return;
		}
		const filter = `?fullname=${encodeURIComponent(name)}`;
		fetchAuditLogs(filter);
	};

	// Build columns directly from API keys
	const columns = [
		{ field: "id", headerName: "ID", width: 70 },
		{ field: "fullName", headerName: "User", width: 180 },
		{ field: "logAction", headerName: "Action", width: 250 },
		{ field: "userId", headerName: "User ID", width: 100 },
		{
			field: "createdAt",
			headerName: "Date",
			width: 200,
			valueFormatter: (params) => new Date(params).toLocaleString(),
		},
	];

	return (
		<Box className='p-4 text-[#636463]'>
			<Typography
				variant='h5'
				gutterBottom
				fontWeight='bold'
				sx={{ color: "#EF7D00" }}
			>
				📜 Audit Trail Logs
			</Typography>

			<form onSubmit={handleSearch} className='flex items-center gap-4 mb-6'>
				<TextField
					label='Filter by full name'
					variant='outlined'
					size='small'
					value={fullname}
					onChange={(e) => setFullname(e.target.value)}
					sx={{
						"& .MuiOutlinedInput-root": {
							"& fieldset": { borderColor: "#636463" },
							"&:hover fieldset": { borderColor: "#F68A8E" },
							"&.Mui-focused fieldset": { borderColor: "#E3000F" },
						},
					}}
				/>
				<Button
					type='submit'
					variant='contained'
					sx={{
						bgcolor: "#FFB84D",
						color: "#fff",
						fontWeight: "bold",
						"&:hover": { bgcolor: "#EF7D00" },
					}}
				>
					Search
				</Button>
			</form>

			{loading ? (
				<LoadingSpinner />
			) : (
				<Paper elevation={3} sx={{ p: 2 }}>
					<DataGrid
						rows={logs}
						columns={columns}
						getRowId={(row) => row.id}
						pageSize={10}
						rowsPerPageOptions={[10, 25, 50]}
						disableSelectionOnClick
						initialState={{
							pagination: { paginationModel: { pageSize: 10 } },
							sorting: {
								sortModel: [{ field: "createdAt", sort: "desc" }],
							},
						}}
						sx={{
							"& .MuiDataGrid-columnHeaders": {
								backgroundColor: "#EF7D00",
								color: "#7F070F",
								fontWeight: "bold",
							},
							"& .MuiDataGrid-row:hover": {
								backgroundColor: "#FFB84D",
							},
							"& .MuiDataGrid-cell": {
								color: "#636463",
							},
						}}
					/>
				</Paper>
			)}
		</Box>
	);
};

export default AuditLogs;
