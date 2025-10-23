import React, { useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";
import { UploadIcon } from "lucide-react";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";

const FileUploadServer = () => {
	const [file, setFile] = useState();
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState();

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setError(null); // Clear previous errors
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (!file) {
			setError("Please select a file to upload.");
			setLoading(false);
			return;
		}

		if (!text.trim()) {
			setError("Please enter the text message.");
			setLoading(false);
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("text", text);

		try {
			const token = localStorage.getItem("access_token");
			const response = await axios.post(
				"https://accessbulk.approot.ng/process_file.php", // Endpoint
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.status) {
				toast.success(response.data.message || "SMS Queued successfully");

				setFile(null);
				setText("");
			} else {
				setError(response.data.message || "Failed to process file.");
			}
		} catch (err) {
			setError(err.message || "An error occurred during upload.");
		} finally {
			setLoading(false);
		}
	};

	const VisuallyHiddenInput = styled("input")({
		clip: "rect(0 0 0 0)",
		clipPath: "inset(50%)",
		height: 1,
		overflow: "hidden",
		position: "absolute",
		bottom: 0,
		left: 0,
		whiteSpace: "nowrap",
		width: 1,
	});

	return (
		<div className='min-h-screen flex items-center justify-center bg-[#F68A8E]/20 px-4'>
			<div className='w-full max-w-lg bg-white p-8 rounded-lg shadow-md border border-[#E3000F]/30'>
				<h2 className='text-2xl font-bold text-center text-[#7F070F] mb-6'>
					Upload File for Processing
				</h2>

				{error && (
					<div className='mb-4 text-sm text-[#7F070F] text-center border border-[#E3000F] rounded-md p-2 bg-[#F68A8E]/30'>
						<span className='font-semibold'>Error: </span>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label
							htmlFor='file'
							className='block text-sm font-medium text-[#636463]'
						>
							Upload File (CSV, Excel)
						</label>
						<Button
							component='label'
							variant='outlined'
							className='w-full mt-1 border-[#E3000F] text-[#7F070F] hover:bg-[#F68A8E]/20'
						>
							<UploadIcon className='mr-2 text-[#E3000F]' />
							Choose File
							<VisuallyHiddenInput
								type='file'
								accept='.csv,.xlsx,.xls'
								onChange={handleFileChange}
							/>
						</Button>
						{file && (
							<p className='text-xs text-[#636463] mt-1'>
								Selected file: {file.name}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor='text'
							className='block text-sm font-medium text-[#636463]'
						>
							Text Message
						</label>
						<TextField
							id='text'
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder='Enter your SMS message here...'
							className='w-full'
							multiline
							rows={4}
							required
							InputProps={{
								style: { borderColor: "#E3000F" },
							}}
						/>
					</div>

					<Button
						type='submit'
						disabled={loading}
						className='w-full'
						variant='contained'
						sx={{
							backgroundColor: "#E3000F",
							"&:hover": { backgroundColor: "#7F070F" },
						}}
					>
						{loading ? "Processing..." : "Upload File"}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default FileUploadServer;
