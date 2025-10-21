import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import {
	FiFileText,
	FiUser,
	FiClock,
	FiMessageSquare,
	FiHash,
	FiList,
	FiGlobe,
} from "react-icons/fi";
import axios from "axios";
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

const FileSummaryPage = () => {
	const location = useLocation();
	const { batch_id } = useParams();
	const [fileDetails, setFileDetails] = useState(location.state?.file || null);
	const [loading, setLoading] = useState(!fileDetails);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!fileDetails && batch_id) {
			const fetchFileById = async () => {
				setLoading(true);
				try {
					const response = await axios.get(
						`https://accessbulk.approot.ng/get_file_by_batch_id.php?batch_id=${batch_id}`
					);
					if (response.data.status && response.data.data) {
						setFileDetails(response.data.data);
					} else {
						setError("File not found or an error occurred.");
					}
				} catch (err) {
					console.error("Error fetching file details:", err);
					setError("Failed to load file details.");
				} finally {
					setLoading(false);
				}
			};
			fetchFileById();
		} else if (!batch_id) {
			setError("No file ID provided.");
			setLoading(false);
		} else {
			setLoading(false);
		}
	}, [fileDetails, batch_id]);

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "80vh",
				}}
			>
				<CircularProgress sx={{ color: BRAND.activeBg }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ textAlign: "center", mt: 4, color: STATUS_COLORS.errorText }}>
				<Typography variant='h6'>{error}</Typography>
			</Box>
		);
	}

	if (!fileDetails) {
		return (
			<Box
				sx={{ textAlign: "center", mt: 4, color: EXTRA_COLORS.text.primary }}
			>
				<Typography variant='h6'>No file details available.</Typography>
				<Typography variant='body2' sx={{ color: EXTRA_COLORS.text.secondary }}>
					Please navigate from the uploaded files table.
				</Typography>
			</Box>
		);
	}

	const fixedRatePerRecipient = 4.9;
	const averageRateComponents = [4.9, 4.9, 4.9, 2.7];
	const fromRatePerRecipient =
		averageRateComponents.reduce((sum, current) => sum + current, 0) /
		averageRateComponents.length;

	const estimatedCostFrom = fileDetails?.total_count
		? (fileDetails.total_count * fromRatePerRecipient).toFixed(2)
		: "N/A";
	const estimatedCostTo = fileDetails?.total_count
		? (fileDetails.total_count * fixedRatePerRecipient).toFixed(2)
		: "N/A";

	return (
		<Box
			sx={{
				p: 4,
				maxWidth: 900,
				mx: "auto",
				backgroundColor: EXTRA_COLORS.background.default,
				minHeight: "100vh",
			}}
		>
			<Typography
				variant='h4'
				gutterBottom
				component='h1'
				sx={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
			>
				<FiFileText style={{ verticalAlign: "middle", marginRight: "8px" }} />
				File Details: {fileDetails.file_name || "N/A"}
			</Typography>

			<Paper
				elevation={3}
				sx={{
					p: 4,
					mt: 3,
					borderRadius: 2,
					backgroundColor: EXTRA_COLORS.background.paper,
				}}
			>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
						gap: 3,
					}}
				>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Batch ID:
						</span>{" "}
						{fileDetails.batch_id}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Uploader:
						</span>{" "}
						{fileDetails.full_name || "Unknown"}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Uploaded At:
						</span>{" "}
						{fileDetails.created_at}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Status:
						</span>{" "}
						{fileDetails.status}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Type:
						</span>{" "}
						{fileDetails.type || "N/A"}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Category:
						</span>{" "}
						{fileDetails.msg_cat || "N/A"}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Total Count:
						</span>{" "}
						{fileDetails.total_count}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Total Distinct:
						</span>{" "}
						{fileDetails.total_distinct}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Duplicates:
						</span>{" "}
						{fileDetails.duplicates}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Amount Sent:
						</span>{" "}
						{fileDetails.count}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Sender ID:
						</span>{" "}
						{fileDetails.senderid || "N/A"}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Scheduled For:
						</span>{" "}
						{fileDetails.schedule_time || "Immediate"}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Cost Center:
						</span>{" "}
						{fileDetails.cost_cntr || ""}
					</Typography>
					<Typography
						variant='body1'
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						<span
							style={{ fontWeight: "bold", color: EXTRA_COLORS.text.primary }}
						>
							Estimated Cost:
						</span>{" "}
						{estimatedCostFrom} - {estimatedCostTo}
					</Typography>
				</Box>
				<Box
					sx={{
						mt: 4,
						borderTop: `1px solid ${EXTRA_COLORS.border.light}`,
						pt: 3,
					}}
				>
					<Typography
						variant='h6'
						gutterBottom
						sx={{ color: EXTRA_COLORS.text.primary }}
					>
						<FiMessageSquare
							style={{ verticalAlign: "middle", marginRight: "8px" }}
						/>
						Message Content:
					</Typography>
					<Typography
						variant='body1'
						sx={{
							whiteSpace: "pre-wrap",
							backgroundColor: EXTRA_COLORS.background.default,
							p: 2,
							borderRadius: 1,
							color: EXTRA_COLORS.text.secondary,
						}}
					>
						{fileDetails.message || "No message content available."}
					</Typography>
				</Box>
			</Paper>
		</Box>
	);
};

export default FileSummaryPage;
