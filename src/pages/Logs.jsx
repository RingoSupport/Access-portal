import { useState } from "react";
import {
	Box,
	Button,
	Tab,
	Tabs,
	TextField,
	Typography,
	Paper,
} from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { MdDownload } from "react-icons/md";

// Brand colors
const BRAND = {
	primary: "#EF7D00", // deep red
	active: "#FFB84D", // brand active red
	hover: "#FFB84D", // lighter pink/red
	textOnPrimary: "#FFFFFF",
};

const Logs = () => {
	const [tab, setTab] = useState(0);
	const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

	const ALTERNATE_TOKEN_KEY = "access_alternate_token";
	const ENCRYPTED_EMAIL_KEY = "access_email";

	const alternateToken = localStorage.getItem(ALTERNATE_TOKEN_KEY);
	const userEmail = localStorage.getItem(ENCRYPTED_EMAIL_KEY);

	const authHeaders = {
		Authorization: `Bearer ${alternateToken}`,
		Email: userEmail || "",
	};

	const handleDownload = async () => {
		if (!date) {
			toast.error("Please select a date");
			return;
		}

		const link = document.createElement("a");
		link.href = `https://bulkaccess.approot.ng/dashboard/logDownload.php?date=${encodeURIComponent(
			date
		)}`;
		link.setAttribute("download", `access_statistics_${date}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success("CSV download started.");
	};

	return (
		<Box className='p-6' sx={{ color: BRAND.primary }}>
			<Typography variant='h5' fontWeight='bold' gutterBottom>
				🗂 Logs
			</Typography>

			<Paper elevation={3} sx={{ mt: 2 }}>
				<Tabs
					value={tab}
					onChange={(_, newValue) => setTab(newValue)}
					textColor='inherit'
					TabIndicatorProps={{ style: { backgroundColor: BRAND.active } }}
					sx={{
						"& .MuiTab-root": {
							color: BRAND.primary,
							fontWeight: "bold",
						},
						"& .Mui-selected": {
							color: BRAND.active,
						},
					}}
				>
					<Tab label='Daily Download' />
					<Tab label='File Download' />
				</Tabs>

				<Box sx={{ p: 3 }}>
					{tab === 0 && (
						<Box>
							<Typography variant='subtitle1' gutterBottom>
								Download statistics CSV for a specific date
							</Typography>

							<form className='flex flex-col sm:flex-row items-center gap-4 mt-4'>
								<TextField
									label='Select Date'
									type='date'
									value={date}
									onChange={(e) => setDate(e.target.value)}
									InputLabelProps={{ shrink: true }}
								/>
								<Button
									variant='contained'
									startIcon={<MdDownload />}
									onClick={handleDownload}
									sx={{
										bgcolor: BRAND.active,
										color: BRAND.textOnPrimary,
										fontWeight: "bold",
										minWidth: 160,
										"&:hover": {
											bgcolor: BRAND.hover,
										},
									}}
								>
									Download CSV
								</Button>
							</form>
						</Box>
					)}

					{tab === 1 && (
						<Box>
							<Typography variant='subtitle1'>
								Coming soon: Download previously exported files.
							</Typography>
						</Box>
					)}
				</Box>
			</Paper>
		</Box>
	);
};

export default Logs;
