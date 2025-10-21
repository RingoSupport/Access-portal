import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import {
	Grid,
	Card,
	CardContent,
	Typography,
	Button,
	CircularProgress,
} from "@mui/material";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Import colors from the palette file
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

const BulkLogs = () => {
	const navigate = useNavigate();
	const { logout } = useContext(AuthContext);

	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);

	const getFiles = useCallback(async () => {
		setLoading(true);
		const token = localStorage.getItem("zenith_token");

		if (!token) {
			logout();
			toast.error("No authentication token found. Please log in.");
			setLoading(false);
			return;
		}

		try {
			const { data, status } = await axios.get(
				"https://accessbulk.approot.ng/list.php",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (status === 401 || status === 403) {
				toast.error(
					data?.message || "Authentication failed. Please log in again."
				);
				logout();
				setLoading(false);
				return;
			}

			if (Array.isArray(data)) {
				setFiles(data);
			} else if (data && data.status && Array.isArray(data.data)) {
				setFiles(data.data);
			} else {
				toast.error(data?.message || "Failed to fetch file list.");
				console.warn("Unexpected response format:", data);
				const errorMessage = data?.message ? data.message.toLowerCase() : "";
				if (
					errorMessage.includes("token decode failed") ||
					errorMessage.includes("session has expired") ||
					errorMessage.includes("invalid token payload") ||
					errorMessage.includes("authorization header is required") ||
					errorMessage.includes("invalid authorization header format")
				) {
					logout();
					toast.info("Your session is invalid. Please log in again.");
				}
			}
			setLoading(false);
		} catch (e) {
			console.error("Error fetching file list:", e);
			toast.error("An error occurred while fetching files.");
			setLoading(false);

			if (axios.isAxiosError(e) && e.response) {
				if (e.response.status === 401 || e.response.status === 403) {
					logout();
					toast.info("Authentication failed. Please log in again.");
				}
			}
		}
	}, [logout]);

	useEffect(() => {
		getFiles();
	}, [getFiles]);

	const handleDownload = (filename) => {
		const url = `https://accessbulk.approot.ngdownloadcsv.php?file=${filename}`;
		window.location.href = url;
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-[200px] font-inter'>
				<CircularProgress sx={{ color: BRAND.activeBg }} />
			</div>
		);
	}

	return (
		<div
			className='font-inter'
			style={{
				backgroundColor: EXTRA_COLORS.background.default,
				minHeight: "100vh",
				padding: "20px 0",
			}}
		>
			<Typography
				variant='h4'
				gutterBottom
				align='center'
				sx={{ mb: 4, fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
			>
				Available Files
			</Typography>
			<Grid container spacing={3} justifyContent='center'>
				{files.length > 0 ? (
					files.map((file, index) => (
						<Grid item xs={12} sm={6} md={4} lg={3} key={index}>
							<Card
								variant='outlined'
								sx={{
									borderRadius: "8px",
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
									backgroundColor: EXTRA_COLORS.background.paper,
									borderColor: EXTRA_COLORS.border.light,
								}}
							>
								<CardContent
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										p: 3,
									}}
								>
									<Typography
										variant='body1'
										gutterBottom
										sx={{
											mb: 2,
											textAlign: "center",
											wordBreak: "break-word",
											color: EXTRA_COLORS.text.primary,
										}}
									>
										{file}
									</Typography>
									<Button
										variant='contained'
										startIcon={<FaDownload />}
										onClick={(e) => {
											e.stopPropagation();
											handleDownload(file);
										}}
										sx={{
											backgroundColor: BRAND.activeBg,
											"&:hover": { backgroundColor: BRAND.hoverBg },
											color: EXTRA_COLORS.background.paper,
											textTransform: "none",
											borderRadius: "8px",
											padding: "10px 20px",
											fontWeight: "bold",
										}}
										fullWidth
									>
										Download
									</Button>
								</CardContent>
							</Card>
						</Grid>
					))
				) : (
					<Grid item xs={12}>
						<Typography
							variant='body1'
							align='center'
							sx={{ mt: 4, color: EXTRA_COLORS.text.secondary }}
						>
							No files available.
						</Typography>
					</Grid>
				)}
			</Grid>
		</div>
	);
};

export default BulkLogs;
