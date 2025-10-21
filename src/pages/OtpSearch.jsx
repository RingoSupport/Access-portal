import { useState, useEffect } from "react";
import axios from "axios";
import {
	TextField,
	Button,
	Paper,
	Box,
	Typography,
	Stack,
	Modal,
	Fade,
	Backdrop,
	IconButton,
	Chip,
	Divider,
	Grid,
	Card,
	CardContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
	Visibility as VisibilityIcon,
	Close as CloseIcon,
	Message as MessageIcon,
	Person as PersonIcon,
	Phone as PhoneIcon,
	Schedule as ScheduleIcon,
	Error as ErrorIcon,
	CheckCircle as CheckCircleIcon,
	NetworkCell as NetworkIcon,
	Send as SendIcon,
} from "@mui/icons-material";
import LoadingSpinner from "../components/Loading";
import { toast } from "react-toastify";
import { getNetwork } from "../utils/number";
import { getStatusChip } from "../utils/status";
import { msgCount } from "../utils/message";
import { formatToLagos } from "../utils/hour";

// Error code descriptions
const errorCodeDescriptions = {
	"000": "Delivered",
	"0dc": "Absent Subscriber",
	206: "Absent Subscriber",
	"21b": "Absent Subscriber",
	"023": "Absent Subscriber",
	"027": "Absent Subscriber",
	"053": "Absent Subscriber",
	"054": "Absent Subscriber",
	"058": "Absent Subscriber",
	439: "Absent subscriber or ported subscriber or subscriber is barred",
	254: "Subscriber's phone inbox is full",
	220: "Subscriber's phone inbox is full",
	120: "Subscriber's phone inbox is full",
	"008": "Subscriber's phone inbox is full",
	255: "Invalid or inactive mobile number or subscriber's phone inbox is full",
	0: "Invalid or inactive mobile number or subscriber's phone inbox is full",
	"20b": "Invalid or inactive mobile number",
	"004": "Invalid or inactive mobile number",
	510: "Invalid or inactive mobile number",
	215: "Invalid or inactive mobile number",
	"20d": "Subscriber is barred on the network",
	130: "Subscriber is barred on the network",
	131: "Subscriber is barred on the network",
	222: "Network operator system failure",
	602: "Network operator system failure",
	306: "Network operator system failure",
	"032": "Network operator system failure or operator not supported",
	"085": "Subscriber is on DND",
	"065": "Message content or senderID is blocked on the promotional route",
	600: "Message content or senderID is blocked on the promotional route",
	"40a": "SenderID not whitelisted on the account",
	"082": "Network operator not supported",
	"00a": "SenderID is restricted by the operator",
	"078": "Restricted message content or senderID is blocked.",
	432: "Restricted message content or senderID is blocked.",
};

const OtpSmsLgs = () => {
	const [number, setNumber] = useState("");
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);

	const mapMessages = (rawMessages) => {
		return rawMessages.map((msg) => {
			const errorDescription =
				errorCodeDescriptions[msg.dlr_request?.toLowerCase?.()] ||
				errorCodeDescriptions[msg.dlr_request] ||
				"N/A";
			return {
				id: msg.id,
				sender: msg.senderid || "ZENITHBANK",
				recipient: msg.msisdn || "N/A",
				message: msg.text || "N/A",
				status: msg.dlr_status || "N/A",
				network: msg.network || "N/A",
				date_sent: formatToLagos(msg.created_at, true) || "N/A",
				date_delivered: msg.updated_at || "N/A",
				dlr_request: msg.dlr_request || "N/A",
				error_description: errorDescription,
			};
		});
	};

	// Fetch last 1000 messages on mount
	useEffect(() => {
		fetchAllMessages();
	}, []);

	const fetchAllMessages = async () => {
		setLoading(true);
		try {
			const response = await axios.get(
				"https://zenithsms.approot.ng/dashboard/otp/messages.php"
			);

			if (response.data.status && response.data.data?.length) {
				setMessages(mapMessages(response.data.data));
			} else {
				toast.info("No messages found.");
				setMessages([]);
			}
		} catch (error) {
			console.error("Failed to fetch messages", error);
			toast.error("Failed to load messages.");
		} finally {
			setLoading(false);
		}
	};

	// 🔎 Fetch messages for a specific number
	const handleSearch = async () => {
		if (!number) {
			toast.warning("Please enter a number");
			return;
		}

		setLoading(true);
		try {
			const response = await axios.get(
				`https://zenithsms.approot.ng/dashboard/otp/number.php?number=${number}`
			);

			if (response.data.status && response.data.data?.length) {
				setMessages(mapMessages(response.data.data));
			} else {
				toast.info("No messages found for this number.");
				setMessages([]);
			}
		} catch (error) {
			console.error("Failed to fetch messages for number", error);
			toast.error("Failed to load messages.");
		} finally {
			setLoading(false);
		}
	};

	const handleViewDetails = (message) => {
		setSelectedMessage(message);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedMessage(null);
	};

	const columns = [
		{
			field: "details",
			headerName: "Details",
			width: 100,
			sortable: false,
			renderCell: (params) => (
				<IconButton
					onClick={() => handleViewDetails(params.row)}
					size='small'
					sx={{
						color: "#EF7D00",
						"&:hover": {
							backgroundColor: "#FFB84D",
						},
					}}
				>
					<VisibilityIcon />
				</IconButton>
			),
		},
		{ field: "id", headerName: "ID", width: 70 },
		{
			field: "sender",
			headerName: "Sender",
			width: 120,
		},
		{
			field: "recipient",
			headerName: "Recipient",
			width: 150,
		},
		{ field: "message", headerName: "Message", width: 200 },
		{
			field: "status",
			headerName: "Status",
			width: 120,
			renderCell: (params) => getStatusChip(params.value),
		},
		{
			field: "network",
			headerName: "Network",
			width: 120,
			renderCell: (params) => {
				const network = params.row.network;
				if (network === "N/A") {
					return getNetwork(params.row.recipient);
				} else {
					return network;
				}
			},
		},
		{ field: "date_sent", headerName: "Date Sent", width: 180 },
		{ field: "date_delivered", headerName: "DLR Time", width: 180 },
		{ field: "dlr_request", headerName: "Error Code", width: 120 },
		{
			field: "error_description",
			headerName: "Error Description",
			width: 250,
			flex: 1,
		},
	];

	return (
		<Box className='p-4 text-[#EF7D00]'>
			<Typography variant='h5' gutterBottom fontWeight='bold'>
				📄 OTP SMS Logs
			</Typography>

			{/* 🔎 Search Bar */}
			<Stack direction='row' spacing={2} sx={{ mb: 2 }}>
				<TextField
					label='Enter Number'
					variant='outlined'
					value={number}
					onChange={(e) => setNumber(e.target.value)}
					fullWidth
				/>
				<Button
					variant='contained'
					sx={{
						backgroundColor: "#FFB84D",
						"&:hover": { backgroundColor: "#EF7D00" },
					}}
					onClick={handleSearch}
				>
					Search
				</Button>
				<Button variant='outlined' color='secondary' onClick={fetchAllMessages}>
					Reset
				</Button>
			</Stack>

			{loading ? (
				<LoadingSpinner />
			) : (
				<Paper elevation={3} sx={{ p: 2 }}>
					<DataGrid
						rows={messages}
						columns={columns}
						getRowId={(row) => row.id}
						loading={loading}
						initialState={{
							pagination: {
								paginationModel: { pageSize: 10 },
							},
						}}
						pageSizeOptions={[10, 25, 50]}
						disableSelectionOnClick
						pagination
						showToolbar
					/>
				</Paper>
			)}

			{/* SMS Details Modal */}
			<Modal
				open={modalOpen}
				onClose={handleCloseModal}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
				onClick={handleCloseModal} // Close modal when clicking backdrop
			>
				<Fade in={modalOpen}>
					<Box
						onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							width: { xs: "95%", sm: "80%", md: "60%" },
							maxWidth: "800px",
							maxHeight: "90vh",
							overflow: "auto",
							bgcolor: "background.paper",
							borderRadius: 3,
							boxShadow: 24,
							p: 0,
						}}
					>
						{/* Header */}
						<Box
							sx={{
								p: 3,
								pb: 2,
								background: "linear-gradient(135deg, #E3000F 0%, #B8000C 100%)",
								color: "white",
								borderRadius: "12px 12px 0 0",
								position: "relative",
							}}
						>
							<Typography
								variant='h5'
								component='h2'
								sx={{ fontWeight: "bold", pr: 5 }}
							>
								📱 SMS Details
							</Typography>
							<IconButton
								onClick={handleCloseModal}
								sx={{
									position: "absolute",
									right: 16,
									top: 16,
									color: "white",
									"&:hover": {
										backgroundColor: "#FFB84D",
									},
								}}
							>
								<CloseIcon />
							</IconButton>
						</Box>

						{/* Content */}
						{selectedMessage && (
							<Box sx={{ p: 3 }}>
								<Grid container spacing={3}>
									{/* Basic Info */}
									<Grid item xs={12} md={6}>
										<Card sx={{ height: "100%", boxShadow: 2 }}>
											<CardContent>
												<Typography
													variant='h6'
													gutterBottom
													sx={{
														color: "#E3000F",
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}
												>
													<PersonIcon /> Basic Information
												</Typography>
												<Divider sx={{ mb: 2 }} />

												<Box sx={{ mb: 2 }}>
													<Typography variant='subtitle2' color='textSecondary'>
														Message ID
													</Typography>
													<Typography
														variant='body1'
														sx={{ fontWeight: "medium" }}
													>
														#{selectedMessage.id}
													</Typography>
												</Box>

												<Box sx={{ mb: 2 }}>
													<Typography variant='subtitle2' color='textSecondary'>
														Sender ID
													</Typography>
													<Chip
														label={selectedMessage.sender}
														size='small'
														sx={{ backgroundColor: "#f5f5f5" }}
														icon={<SendIcon />}
													/>
												</Box>

												<Box sx={{ mb: 2 }}>
													<Typography variant='subtitle2' color='textSecondary'>
														Recipient
													</Typography>
													<Typography
														variant='body1'
														sx={{
															fontWeight: "medium",
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<PhoneIcon fontSize='small' color='action' />
														{selectedMessage.recipient}
													</Typography>
												</Box>

												<Box>
													<Typography variant='subtitle2' color='textSecondary'>
														Network
													</Typography>
													<Chip
														label={
															selectedMessage.network === "N/A"
																? getNetwork(selectedMessage.recipient)
																: selectedMessage.network
														}
														size='small'
														color='primary'
														variant='outlined'
														icon={<NetworkIcon />}
													/>
												</Box>
											</CardContent>
										</Card>
									</Grid>

									{/* Status & Technical Info */}
									<Grid item xs={12} md={6}>
										<Card sx={{ height: "100%", boxShadow: 2 }}>
											<CardContent>
												<Typography
													variant='h6'
													gutterBottom
													sx={{
														color: "#E3000F",
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}
												>
													<ErrorIcon /> Status & Technical
												</Typography>
												<Divider sx={{ mb: 2 }} />

												<Box sx={{ mb: 2 }}>
													<Typography variant='subtitle2' color='textSecondary'>
														Delivery Status
													</Typography>
													{getStatusChip(selectedMessage.status)}
												</Box>

												<Box sx={{ mb: 2 }}>
													<Typography variant='subtitle2' color='textSecondary'>
														Error Code
													</Typography>
													<Typography
														variant='body1'
														sx={{
															fontFamily: "monospace",
															backgroundColor: "#f5f5f5",
															padding: "4px 8px",
															borderRadius: "4px",
															display: "inline-block",
														}}
													>
														{selectedMessage.dlr_request}
													</Typography>
												</Box>

												<Box sx={{ mb: 2 }}>
													<Typography variant='subtitle2' color='textSecondary'>
														Date Sent
													</Typography>
													<Typography
														variant='body1'
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<ScheduleIcon fontSize='small' color='action' />
														{new Date(
															selectedMessage.date_sent
														).toLocaleString()}
													</Typography>
												</Box>
												<Box sx={{ mb: 2 }}>
													<Typography variant='subtitle2' color='textSecondary'>
														Date delivered
													</Typography>
													<Typography
														variant='body1'
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<ScheduleIcon fontSize='small' color='action' />
														{new Date(
															selectedMessage.date_delivered
														).toLocaleString()}
													</Typography>
												</Box>
											</CardContent>
										</Card>
									</Grid>

									{/* Message Content */}
									<Grid item xs={12}>
										<Card sx={{ boxShadow: 2 }}>
											<CardContent>
												<Typography
													variant='h6'
													gutterBottom
													sx={{
														color: "#E3000F",
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}
												>
													<MessageIcon /> Message Content
												</Typography>
												<Divider sx={{ mb: 2 }} />

												<Paper
													sx={{
														p: 2,
														backgroundColor: "#f8f9fa",
														border: "1px solid #e9ecef",
														minHeight: "80px",
													}}
												>
													<Typography variant='body1' sx={{ lineHeight: 1.6 }}>
														{selectedMessage.message}
													</Typography>
												</Paper>

												<Box sx={{ mt: 2 }}>
													<Typography variant='caption' color='textSecondary'>
														{(() => {
															const [parts, count] = msgCount(
																selectedMessage.message || ""
															);
															return `Character Count: ${count} | SMS Parts: ${parts}`;
														})()}
													</Typography>
												</Box>
											</CardContent>
										</Card>
									</Grid>

									{/* Error Description */}
									<Grid item xs={12}>
										<Card
											sx={{
												boxShadow: 2,
												border:
													selectedMessage.error_description !== "Delivered" &&
													selectedMessage.error_description !== "N/A"
														? "1px solid #f44336"
														: "1px solid #4caf50",
											}}
										>
											<CardContent>
												<Typography
													variant='h6'
													gutterBottom
													sx={{
														color:
															selectedMessage.error_description !==
																"Delivered" &&
															selectedMessage.error_description !== "N/A"
																? "#f44336"
																: "#4caf50",
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}
												>
													{selectedMessage.error_description !== "Delivered" &&
													selectedMessage.error_description !== "N/A" ? (
														<ErrorIcon />
													) : (
														<CheckCircleIcon />
													)}
													Delivery Information
												</Typography>
												<Divider sx={{ mb: 2 }} />

												<Typography
													variant='body1'
													sx={{
														padding: "12px 16px",
														backgroundColor:
															selectedMessage.error_description !==
																"Delivered" &&
															selectedMessage.error_description !== "N/A"
																? "#ffebee"
																: "#e8f5e8",
														borderRadius: "8px",
														border:
															selectedMessage.error_description !==
																"Delivered" &&
															selectedMessage.error_description !== "N/A"
																? "1px solid #ffcdd2"
																: "1px solid #c8e6c9",
													}}
												>
													{selectedMessage.error_description}
												</Typography>
											</CardContent>
										</Card>
									</Grid>
								</Grid>

								{/* Footer */}
								<Box sx={{ mt: 3, textAlign: "center" }}>
									<Button
										onClick={handleCloseModal}
										variant='contained'
										sx={{
											backgroundColor: "#EF7D00",
											"&:hover": { backgroundColor: "#FFB84D" },
											px: 4,
										}}
									>
										Close
									</Button>
								</Box>
							</Box>
						)}
					</Box>
				</Fade>
			</Modal>
		</Box>
	);
};

export default OtpSmsLgs;
