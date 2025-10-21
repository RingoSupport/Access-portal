import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
	Button,
	Typography,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const SummaryPage = () => {
	const [text, setText] = useState("");
	const [batchId, setBathId] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [smsType, setSmsType] = useState("");
	const [batch, setBAtch] = useState([]);
	const [csvPreview, setCsvPreview] = useState({});
	const [senderId, setSenderId] = useState("");
	const [costCenter, setCostCenter] = useState("");
	const [sender, setSender] = useState([]);
	const [category, setCategory] = useState([]);
	const [selectedColumn, setSelectedColumn] = useState("");
	const [scheduledAt, setScheduledAt] = useState("");
	const [messageAction, setMessageAction] = useState("update");
	const textFieldRef = useRef(null);

	const location = useLocation();
	const navigate = useNavigate();
	const files = location.state?.file;

	useEffect(() => {
		const fetchBatch = async () => {
			try {
				const response = await axios.get(
					`https://accessbulk.approot.ng/categories.php?batch_id=${files.batch_id}`
				);
				if (response.data.status) {
					setCategory(response.data.category);
					setSender(response.data.sender);
					setBAtch(response.data.batch_info);
					setCsvPreview(response.data.csv_preview);
				} else {
					setError(response.data.message || "File still being updated.");
				}
			} catch (err) {
				setError("File still being updated.");
			}
		};
		fetchBatch();
	}, []);

	useEffect(() => {
		if (batch[0]?.message) setText(batch[0].message);
	}, [batch]);

	useEffect(() => {
		if (messageAction === "update" && batch[0]?.batch_id) {
			setBathId(batch[0].batch_id);
		} else if (messageAction === "create") {
			setBathId(new Date().getTime());
		}
	}, [messageAction, batch]);

	if (!files) {
		navigate("/portal");
		return null;
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		const originalBatch = batch[0] || {};

		const messagePlaceholders = [...text.matchAll(/\[([^\]]+)\]/g)].map(
			(match) => match[1]
		);
		const usedParams = [...new Set(messagePlaceholders)].slice(0, 5);

		const payload = {
			...originalBatch,
			message: text,
			senderid: senderId,
			type: files.type || "General",
			msg_cat: smsType,
			batch_id: batchId,
			schedule_time: scheduledAt,
			cost_cntr: costCenter,
			paramCount: usedParams.length,
			params1: usedParams[0] || "",
			params2: usedParams[1] || "",
			params3: usedParams[2] || "",
			params4: usedParams[3] || "",
			params5: usedParams[4] || "",
			file_path: files.file_path,
		};

		try {
			const token = localStorage.getItem("zenith_token");
			const url =
				messageAction === "create"
					? "https://accessbulk.approot.ng/create_message.php"
					: "https://accessbulk.approot.ng/fileUpload.php";

			const response = await axios.post(url, payload, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.data.status) {
				toast.success(response.data.message || "SMS saved successfully");
				setText("");
				navigate("/dashboard");
			} else {
				setError(response.data.message || "Failed to process request.");
			}
		} catch (err) {
			setError(err.message || "An error occurred.");
		} finally {
			setLoading(false);
		}
	};

	const getRenderedMessage = () => {
		if (!text) return "";
		let rendered = text;
		Object.entries(csvPreview).forEach(([key, value]) => {
			rendered = rendered.replaceAll(`[${key}]`, value || "");
		});
		return rendered;
	};

	const availableParams = Object.keys(csvPreview);

	const getMessageUnits = (message) => {
		const specialChars = ["€", "^", "{", "}", "[", "]", "~", "|"];
		let count = 0;
		for (let i = 0; i < message.length; i++) {
			count += specialChars.includes(message[i]) ? 2 : 1;
		}
		return count;
	};

	const renderedMessage = getRenderedMessage();
	const charUnits = getMessageUnits(renderedMessage);
	const pageCount = charUnits <= 160 ? 1 : Math.ceil(charUnits / 153);
	const fixedRatePerRecipient = 5;

	const estimatedCostTo = files?.total_count
		? (files.total_count * fixedRatePerRecipient).toFixed(2)
		: "N/A";

	const adjustedCostTo = estimatedCostTo * pageCount;

	return (
		<div
			className='min-h-screen px-4 py-8'
			style={{ backgroundColor: "#fafafa" }}
		>
			<div className='w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8'>
				<div className='bg-white p-6 rounded-xl shadow'>
					<h2
						className='text-2xl font-bold mb-4 text-center'
						style={{ color: "#E3000F" }}
					>
						Send Bulk SMS
					</h2>

					{error && (
						<div
							className='mb-4 text-sm p-2 rounded'
							style={{
								backgroundColor: "#FDEDED",
								border: `1px solid #F68A8E`,
								color: "#7F070F",
							}}
						>
							<strong>Error:</strong> {error}
						</div>
					)}

					<div
						className='mb-6 p-4 rounded-lg'
						style={{
							backgroundColor: "#fff5f5",
							border: `1px solid #F68A8E`,
							color: "#636463",
						}}
					>
						<h3
							className='text-lg font-semibold mb-3'
							style={{ color: "#E3000F" }}
						>
							Uploaded File Summary
						</h3>
						<ul className='text-sm space-y-1'>
							<li>
								<strong>File Name:</strong> {files?.file_name}
							</li>
							<li>
								<strong>Batch ID:</strong> {files?.batch_id}
							</li>
							<li>
								<strong>Uploaded By:</strong> {files?.full_name}
							</li>
							<li>
								<strong>Total Recipients:</strong> {files?.total_count}
							</li>
							<li>
								<strong>Unique Numbers:</strong> {files?.total_distinct}
							</li>
							<li>
								<strong>Total Duplicates:</strong>{" "}
								{Number(files?.total_count) - Number(files?.total_distinct)}
							</li>
							<li>
								<strong>Uploaded At:</strong> {files?.created_at}
							</li>
							<li>
								<strong>Estimated Cost:</strong> ₦{adjustedCostTo}
							</li>
						</ul>
					</div>

					<form onSubmit={handleSubmit} className='space-y-5'>
						<TextField
							label='Batch ID'
							value={batchId}
							onChange={(e) => setBathId(e.target.value)}
							fullWidth
							required
						/>

						<FormControl fullWidth>
							<InputLabel id='sms-type-label'>SMS Type</InputLabel>
							<Select
								labelId='sms-type-label'
								value={smsType}
								onChange={(e) => setSmsType(e.target.value)}
								required
							>
								{category.map((item) => (
									<MenuItem key={item.category_name} value={item.category_name}>
										{item.category_name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							label='Cost Center'
							value={costCenter}
							onChange={(e) => setCostCenter(e.target.value)}
							fullWidth
							required
						/>

						<FormControl fullWidth>
							<InputLabel id='param-label'>Available Params</InputLabel>
							<Select
								labelId='param-label'
								value={selectedColumn}
								onChange={(e) => {
									const param = e.target.value;
									setSelectedColumn(param);
									const textArea = textFieldRef.current;
									if (!textArea) return;
									const cursorPos = textArea.selectionStart;
									const newText =
										text.slice(0, cursorPos) +
										` [${param}]` +
										text.slice(cursorPos);
									setText(newText);
									setTimeout(() => {
										textArea.focus();
										textArea.selectionStart = textArea.selectionEnd =
											cursorPos + ` [${param}]`.length;
									}, 0);
								}}
							>
								{availableParams.map((param) => (
									<MenuItem key={param} value={param}>
										{param}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							label='Message Text'
							value={text}
							onChange={(e) => setText(e.target.value)}
							fullWidth
							multiline
							minRows={4}
							inputProps={{ ref: textFieldRef }}
						/>

						<Typography
							variant='body2'
							className='mt-2'
							style={{ color: "#636463" }}
						>
							Characters: {charUnits} | Pages: {pageCount}
						</Typography>

						<FormControl fullWidth>
							<InputLabel id='sender-id-label'>Sender ID</InputLabel>
							<Select
								labelId='sender-id-label'
								value={senderId}
								onChange={(e) => setSenderId(e.target.value)}
								required
							>
								{sender.map((item) => (
									<MenuItem key={item.sender_name} value={item.sender_name}>
										{item.sender_name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel id='message-action-label'>Message Action</InputLabel>
							<Select
								labelId='message-action-label'
								value={messageAction}
								onChange={(e) => setMessageAction(e.target.value)}
								required
							>
								<MenuItem value='create'>Create New Message</MenuItem>
								<MenuItem value='update'>Update Existing Message</MenuItem>
							</Select>
						</FormControl>

						<TextField
							label='Scheduled At'
							type='datetime-local'
							value={scheduledAt}
							onChange={(e) => setScheduledAt(e.target.value)}
							fullWidth
							InputLabelProps={{ shrink: true }}
						/>

						<Button
							type='submit'
							disabled={loading}
							fullWidth
							variant='contained'
							style={{
								backgroundColor: "#E3000F",
								color: "#fff",
							}}
							onMouseOver={(e) =>
								(e.currentTarget.style.backgroundColor = "#7F070F")
							}
							onMouseOut={(e) =>
								(e.currentTarget.style.backgroundColor = "#E3000F")
							}
						>
							{loading ? "Processing..." : "Send SMS"}
						</Button>
					</form>
				</div>

				{/* Chat Preview */}
				<div className='w-full md:max-w-sm bg-[#0e0f11] rounded-[2.5rem] shadow-2xl h-[520px] p-3 flex flex-col justify-between border border-gray-800 relative overflow-hidden mx-auto'>
					<div className='absolute top-3 left-1/2 -translate-x-1/2 w-20 h-2 rounded-full bg-gray-700 opacity-50'></div>
					<div className='flex-1 mt-8 mb-6 mx-3 bg-gray-50 rounded-xl shadow-inner p-3 overflow-y-auto custom-scrollbar'>
						{getRenderedMessage() ? (
							<div className='flex justify-end'>
								<div
									className='px-4 py-2 rounded-2xl shadow-md max-w-[80%] text-sm whitespace-pre-line'
									style={{
										background:
											"linear-gradient(to bottom right, #E3000F, #F68A8E)",
										color: "white",
									}}
								>
									{getRenderedMessage()}
								</div>
							</div>
						) : (
							<div
								className='text-sm text-center mt-20'
								style={{ color: "#636463" }}
							>
								Message preview will appear here...
							</div>
						)}
					</div>
					<div className='flex justify-center pb-2'>
						<div
							className='w-12 h-1.5 rounded-full'
							style={{ backgroundColor: "#636463" }}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SummaryPage;
