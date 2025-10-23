import React, { useState } from "react";
import axios from "axios";
import {
	Button,
	TextField,
	MenuItem,
	FormControl,
	Select,
	InputLabel,
} from "@mui/material";
import { UploadIcon } from "lucide-react";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { BRAND, STATUS_COLORS as colors } from "../theme/colors";

const specialChars = ["€", "^", "{", "}", "[", "]", "~", "|"];

/** Buttons with brand styling */
const PrimaryButton = styled(Button)({
	backgroundColor: BRAND.sidebarBg,
	color: "#fff",
	textTransform: "none",
	borderRadius: 12,
	padding: "10px 16px",
	boxShadow: "none",
	"&:hover": { backgroundColor: BRAND.hoverBg, boxShadow: "none" },
});

const OutlineBrandButton = styled(Button)({
	borderColor: BRAND.activeBg,
	color: BRAND.sidebarBg,
	textTransform: "none",
	borderRadius: 12,
	"&:hover": {
		borderColor: BRAND.hoverBg,
		backgroundColor: "rgba(253,184,19,0.12)", // #FDB813 @ 12%
	},
});

/** Hidden input for file selection */
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

const SendMultipleSmsPage = () => {
	const [file, setFile] = useState(null);
	const [batchId, setBatchId] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [columns, setColumns] = useState([]);
	const [firstRow, setFirstRow] = useState({});
	const [phoneHeader, setPhoneHeader] = useState("");
	const [message, setMessage] = useState("");
	const [scheduledAt, setScheduledAt] = useState("");
	const [smsLength, setSmsLength] = useState(0);
	const [smsPages, setSmsPages] = useState(1);

	const navigate = useNavigate();

	/** Handle file upload and parse CSV or Excel */
	const handleFileChange = (e) => {
		const uploadedFile = e.target.files?.[0];
		if (!uploadedFile) return;

		setFile(uploadedFile);
		setBatchId(Date.now().toString());
		setError(null);

		const reader = new FileReader();
		const isCSV = uploadedFile.name.toLowerCase().endsWith(".csv");

		reader.onload = (event) => {
			if (isCSV) {
				Papa.parse(event.target.result, {
					header: true,
					skipEmptyLines: true,
					complete: (results) => {
						setColumns(results.meta.fields || []);
						setFirstRow(results.data?.[0] || {});
					},
				});
			} else {
				const data = new Uint8Array(event.target.result);
				const workbook = XLSX.read(data, { type: "array" });
				const sheetName = workbook.SheetNames[0];
				const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
					header: 1,
				});

				const headers = sheet?.[0] || [];
				const values = sheet?.[1] || [];
				const rowObj = {};
				headers.forEach((key, i) => (rowObj[key] = values[i]));

				setColumns(headers);
				setFirstRow(rowObj);
			}
		};

		isCSV
			? reader.readAsText(uploadedFile)
			: reader.readAsArrayBuffer(uploadedFile);
	};

	/** Calculate SMS length and pages */
	const calculateSmsPages = (text) => {
		let length = [...text].reduce(
			(total, char) => total + (specialChars.includes(char) ? 2 : 1),
			0
		);

		let pages = 1;
		if (length > 160 && length <= 306) pages = 2;
		else if (length > 306) pages = Math.ceil(length / 153);

		return { length, pages };
	};

	/** Update SMS length and pages on message change */
	const handleTextChange = (e) => {
		const value = e.target.value;
		setMessage(value);

		const { length, pages } = calculateSmsPages(value);
		setSmsLength(length);
		setSmsPages(pages);
	};

	/** Insert a placeholder like [first_name] into message */
	const insertPlaceholder = (col) => {
		const token = `[${col}]`;
		setMessage((prev) => (prev ? `${prev} ${token}` : token));
		const { length, pages } = calculateSmsPages(`${message} ${token}`.trim());
		setSmsLength(length);
		setSmsPages(pages);
	};

	/** Render sample message with placeholders replaced by first row values */
	const getRenderedMessage = () => {
		if (!message) return "";
		return columns.reduce(
			(acc, col) => acc.replaceAll(`[${col}]`, firstRow[col] ?? ""),
			message
		);
	};

	/** Form submission handler */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (!file) {
			setError("Please select a file.");
			setLoading(false);
			return;
		}

		if (!phoneHeader) {
			setError("Please specify the phone number column.");
			setLoading(false);
			return;
		}

		if (!columns.includes(phoneHeader)) {
			setError(
				"The specified phone column does not exist in the uploaded file."
			);
			setLoading(false);
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("batchId", batchId);
		formData.append("phoneHeader", phoneHeader);
		try {
			const token = localStorage.getItem("access_token");
			const { data } = await axios.post(
				"https://accessbulk.approot.ng/queues2.php",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (data.status) {
				toast.success(data.message || "SMS Queued successfully");
				navigate("/portal");
			} else {
				setError(data.message || "Failed to process file.");
			}
		} catch (err) {
			setError(err.message || "An error occurred during upload.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-100 p-4'>
			{/* Header */}
			<div className='max-w-3xl mx-auto'>
				<div
					className='rounded-xl p-5 mb-4 shadow-sm'
					style={{
						backgroundColor: "rgba(253,184,19,0.12)",
						border: `1px solid ${BRAND.activeBg}`,
					}}
				>
					<h2
						className='text-2xl font-bold text-center'
						style={{ color: BRAND.sidebarBg }}
					>
						Upload & Send Multiple SMS
					</h2>
				</div>

				{/* Main Card */}
				<div
					className='bg-white p-6 rounded-xl shadow-md border'
					style={{ borderColor: "#f1f1f1" }}
				>
					{error && (
						<div
							className='mb-4 text-sm text-center rounded-md p-3'
							style={{
								backgroundColor: colors.errorBg,
								border: `1px solid ${colors.errorBorder}`,
								color: colors.errorText,
							}}
						>
							<strong>Error:</strong> {error}
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* 1) File Upload */}
						<div>
							<label
								className='block text-sm font-medium mb-1'
								style={{ color: BRAND.sidebarBg }}
							>
								Upload File (CSV, Excel)
							</label>
							<OutlineBrandButton
								component='label'
								variant='outlined'
								fullWidth
								startIcon={<UploadIcon />}
							>
								Choose File
								<VisuallyHiddenInput
									type='file'
									accept='.csv,.xlsx,.xls'
									onChange={handleFileChange}
								/>
							</OutlineBrandButton>
							{file && (
								<p className='text-xs mt-1' style={{ color: BRAND.sidebarBg }}>
									Selected file:{" "}
									<span className='font-medium'>{file.name}</span>
								</p>
							)}
						</div>

						{/* 2) Batch ID */}
						<TextField
							label='Batch ID'
							value={batchId}
							onChange={(e) => setBatchId(e.target.value)}
							fullWidth
							required
							size='small'
							InputLabelProps={{ style: { color: BRAND.sidebarBg } }}
						/>

						{/* 3) Phone Number Column */}
						{columns.length > 0 && (
							<FormControl fullWidth size='small'>
								<InputLabel
									id='phone-col-label'
									style={{ color: BRAND.sidebarBg }}
								>
									Phone No Column
								</InputLabel>
								<Select
									labelId='phone-col-label'
									value={phoneHeader}
									onChange={(e) => setPhoneHeader(e.target.value)}
									label='Phone No Column'
								>
									{columns.map((col) => (
										<MenuItem key={col} value={col}>
											{col}
										</MenuItem>
									))}
								</Select>
								{/* Helper: quick placeholders chips */}
								{columns.length > 0 && (
									<div className='flex flex-wrap gap-2 mt-2'>
										{columns.map((col) => (
											<button
												key={col}
												type='button'
												onClick={() => insertPlaceholder(col)}
												className='text-xs px-2 py-1 rounded-full'
												style={{
													backgroundColor: "rgba(253,184,19,0.18)",
													color: BRAND.sidebarBg,
													border: `1px solid ${BRAND.activeBg}`,
												}}
												title={`Insert [${col}]`}
											>
												[{col}]
											</button>
										))}
									</div>
								)}
							</FormControl>
						)}

						{/* 5) Preview */}
						{message && (
							<div
								className='rounded-lg p-3 text-sm'
								style={{
									backgroundColor: "rgba(253,184,19,0.08)",
									border: `1px dashed ${BRAND.activeBg}`,
									color: BRAND.sidebarBg,
								}}
							>
								<div
									className='font-semibold mb-1'
									style={{ color: BRAND.sidebarBg }}
								>
									Preview (first row):
								</div>
								<div className='whitespace-pre-wrap'>
									{getRenderedMessage()}
								</div>
							</div>
						)}
						{/* Submit */}
						<PrimaryButton type='submit' fullWidth disabled={loading}>
							{loading ? "Processing..." : "Upload & Queue SMS"}
						</PrimaryButton>
					</form>
				</div>
			</div>
		</div>
	);
};

export default SendMultipleSmsPage;
