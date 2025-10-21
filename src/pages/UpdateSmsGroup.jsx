import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const UpdateSmsGroupNumbersPage = () => {
	const [groups, setGroups] = useState([]);
	const [groupId, setGroupId] = useState("");
	const [numbers, setNumbers] = useState([]);
	const [action, setAction] = useState("add");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [file, setFile] = useState(null);
	const navigate = useNavigate();

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setNumbers([]);
		}
	};

	useEffect(() => {
		const fetchGroups = async () => {
			try {
				const token = localStorage.getItem("zenith_token");
				const response = await axios.get(
					"https://accessbulk.approot.ng//list_groups.php",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (response.data.status) {
					setGroups(response.data.groups);
				} else {
					setError(response.data.message || "Failed to load groups.");
				}
			} catch (err) {
				setError("Error loading groups.");
			}
		};
		fetchGroups();
	}, []);

	const parseFile = useCallback((file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const data = event.target?.result;
					if (!data) {
						reject(new Error("No data read from file"));
						return;
					}

					let extractedNumbers = [];

					if (file.name.endsWith(".csv")) {
						// Handle CSV
						const text = data;
						const lines = text.split("\n").filter((line) => line.trim() !== "");
						const header = lines[0].split(",").map((h) => h.trim());
						const hasHeader = header.some((h) => isNaN(Number(h)));

						if (hasHeader) {
							extractedNumbers = lines
								.slice(1)
								.map((line) => line.split(",")[0].trim());
						} else {
							extractedNumbers = lines.map((line) => line.split(",")[0].trim());
						}
						extractedNumbers = extractedNumbers.filter((n) => n !== "");
						extractedNumbers = extractedNumbers.map((number) => {
							let formattedNumber = number.replace(/[-/s]/g, "");
							if (formattedNumber.startsWith("0")) {
								formattedNumber = "234" + formattedNumber.slice(1);
							} else if (formattedNumber.startsWith("+")) {
								formattedNumber = formattedNumber.replace("+", "");
							}
							return formattedNumber;
						});
						resolve(extractedNumbers);
					} else if ([".xlsx", ".xls"].some((ext) => file.name.endsWith(ext))) {
						// Handle Excel
						const workbook = XLSX.read(data, { type: "array" });
						const sheetName = workbook.SheetNames[0];
						const worksheet = workbook.Sheets[sheetName];
						const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

						const hasHeader =
							Array.isArray(rawData[0]) &&
							rawData[0].some((h) => isNaN(Number(h)));

						if (hasHeader) {
							extractedNumbers = rawData
								.slice(1)
								.map((row) =>
									Array.isArray(row) ? String(row[0]).trim() : ""
								);
						} else {
							extractedNumbers = rawData.map((row) =>
								Array.isArray(row) ? String(row[0]).trim() : ""
							);
						}
						extractedNumbers = extractedNumbers.filter((n) => n !== "");
						extractedNumbers = extractedNumbers.map((number) => {
							let formattedNumber = number.replace(/[-/s]/g, "");
							if (formattedNumber.startsWith("0")) {
								formattedNumber = "234" + formattedNumber.slice(1);
							} else if (formattedNumber.startsWith("+")) {
								formattedNumber = formattedNumber.replace("+", "");
							}
							return formattedNumber;
						});
						resolve(extractedNumbers);
					} else {
						reject(
							new Error("Unsupported file type.  Use .csv, .xlsx, or .xls")
						);
					}
				} catch (e) {
					reject(new Error("Error parsing file: " + e.message));
				}
			};

			reader.onerror = () => {
				reject(new Error("Error reading file"));
			};

			if (file.name.endsWith(".csv")) {
				reader.readAsText(file);
			} else {
				reader.readAsArrayBuffer(file);
			}
		});
	}, []);

	useEffect(() => {
		if (file) {
			setLoading(true);
			parseFile(file)
				.then((numbers) => {
					setNumbers(numbers);
				})
				.catch((err) => {
					setError(err.message);
				})
				.finally(() => setLoading(false));
		}
	}, [file, parseFile]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (!file) {
			setError("Please upload a valid file.");
			setLoading(false);
			return;
		}

		try {
			const token = localStorage.getItem("zenith_token");
			const formData = new FormData();
			formData.append("file", file);
			formData.append("group_id", groupId);
			formData.append("action", action);

			const response = await axios.post(
				"https://accessbulk.approot.ng//update_sms_group_numbers.php",
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.status) {
				toast.success("Upload successful!");
				navigate("/portal");
			} else {
				setError(response.data.message || "Failed to update group.");
			}
		} catch (err) {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
			<div className='w-full max-w-3xl bg-white shadow-lg rounded-xl p-8'>
				<h2 className='text-3xl font-semibold text-center text-gray-800 mb-6'>
					Update SMS Group Numbers
				</h2>

				{error && <div className='text-red-600 text-center mb-4'>{error}</div>}

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Select SMS Group
						</label>
						<select
							value={groupId}
							onChange={(e) => setGroupId(e.target.value)}
							className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400'
							required
						>
							<option value=''>-- Select Group --</option>
							{groups.map((group) => (
								<option key={group.id} value={group.id}>
									{group.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Upload CSV/Excel File
						</label>
						<input
							type='file'
							accept='.csv,.xlsx'
							onChange={handleFileChange}
							className='w-full border border-gray-300 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700'
						/>
						<p className='text-sm text-gray-500 mt-1'>
							Supported formats: .csv, .xlsx. Uploading a file will disable
							manual entry.
						</p>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Action
						</label>
						<select
							value={action}
							onChange={(e) => setAction(e.target.value)}
							className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400'
						>
							<option value='add'>Add Numbers</option>
							<option value='remove'>Remove Numbers</option>
						</select>
					</div>

					<div>
						<button
							type='submit'
							disabled={loading}
							className={`w-full py-3 text-white rounded-lg font-semibold transition ${
								loading
									? "bg-blue-300 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{loading ? "Updating..." : "Update Group Numbers"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UpdateSmsGroupNumbersPage;
