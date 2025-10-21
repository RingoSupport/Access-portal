import { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";

const CreditWallet = () => {
	const [form, setForm] = useState({
		amount: "",
		reference: `CREDIT-${new Date().getTime()}`,
		description: "WALLET FUNDING",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const token = localStorage.getItem("providustoken");
		if (!token) {
			toast.error("No authentication token found.");
			return;
		}

		if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
			toast.error("Please enter a valid amount.");
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post(
				"https://providus.approot.ng/server/creditWallet.php",
				form,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = response.data;
			if (data.status === "success") {
				toast.success(data.message);
				setForm({ amount: "", reference: "", description: "" });
			} else {
				toast.error(data.message || "Failed to credit wallet.");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className='p-4 text-[#7F070F]'>
			<Typography
				variant='h5'
				fontWeight='bold'
				gutterBottom
				sx={{ color: "#E3000F" }} // primary heading
			>
				Credit Wallet
			</Typography>

			<Paper
				elevation={3}
				className='p-4 max-w-xl'
				sx={{ border: `1px solid ${"#636463"}` }}
			>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<TextField
						fullWidth
						label='Amount'
						name='amount'
						value={form.amount}
						onChange={handleChange}
						type='number'
						variant='outlined'
					/>
					<TextField
						fullWidth
						label='Reference'
						name='reference'
						value={form.reference}
						onChange={handleChange}
						variant='outlined'
					/>
					<TextField
						fullWidth
						label='Description'
						name='description'
						value={form.description}
						onChange={handleChange}
						variant='outlined'
					/>

					<Button
						type='submit'
						variant='contained'
						disabled={loading}
						sx={{
							bgcolor: "#E3000F", // primary red
							color: "#FFFFFF",
							fontWeight: "bold",
							"&:hover": { bgcolor: "#7F070F" }, // dark shade
						}}
					>
						{loading ? "Processing..." : "Credit Wallet"}
					</Button>
				</form>
			</Paper>
		</Box>
	);
};

export default CreditWallet;
