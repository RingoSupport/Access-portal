import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiFileText, FiUser, FiClock, FiInbox, FiSearch } from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

const UploadedFilesList = () => {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterDate, setFilterDate] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	useEffect(() => {
		const fetchFiles = async () => {
			const token = localStorage.getItem("access_token");
			try {
				const res = await axios.get("https://accessbulk.approot.ng/send.php", {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (res.data.status && Array.isArray(res.data.data)) {
					setFiles(res.data.data);
				} else {
					setFiles([]);
					if (!res.data.status && res.data.message) {
						setError(res.data.message);
					}
				}
			} catch (err) {
				setError("Failed to load uploaded files. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchFiles();
		const interval = setInterval(fetchFiles, 5000);
		return () => clearInterval(interval);
	}, []);

	// Filter + Pagination
	const filteredFiles = files.filter((file) => {
		const nameMatch = file.file_name
			?.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const dateMatch = filterDate
			? file.created_at?.startsWith(filterDate)
			: true;
		return nameMatch && dateMatch;
	});

	const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
	const paginatedFiles = filteredFiles.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Reset to first page on filter change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, filterDate]);

	if (loading) {
		return (
			<div
				className='text-center py-20 flex flex-col items-center justify-center'
				style={{ color: EXTRA_COLORS.text.muted }}
			>
				<CircularProgress
					size={40}
					className='mb-3'
					sx={{ color: BRAND.sidebarBg }}
				/>
				<p className='text-lg'>Loading uploaded files...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className='text-center py-20 font-medium text-lg'
				style={{ color: STATUS_COLORS.errorText }}
			>
				<p>{error}</p>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-4 py-10'>
			<h2
				className='text-3xl font-bold text-center mb-8'
				style={{ color: BRAND.sidebarBg }}
			>
				Recently Uploaded Files
			</h2>

			{/* Filters */}
			<div className='flex flex-col md:flex-row gap-4 justify-between items-center mb-8'>
				<div
					className='flex items-center w-full md:w-1/2 px-4 py-2 rounded-md shadow-sm border'
					style={{
						backgroundColor: EXTRA_COLORS.background.paper,
						borderColor: EXTRA_COLORS.border.light,
					}}
				>
					<FiSearch
						className='mr-2 text-lg'
						style={{ color: EXTRA_COLORS.text.muted }}
					/>
					<input
						type='text'
						placeholder='Search by file name...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full bg-transparent focus:outline-none text-sm'
						style={{ color: EXTRA_COLORS.text.primary }}
					/>
				</div>
				<input
					type='date'
					value={filterDate}
					onChange={(e) => setFilterDate(e.target.value)}
					className='px-4 py-2 border rounded-md shadow-sm focus:outline-none'
					style={{
						borderColor: EXTRA_COLORS.border.light,
						backgroundColor: EXTRA_COLORS.background.paper,
						color: EXTRA_COLORS.text.primary,
					}}
				/>
			</div>

			{/* File Cards */}
			{paginatedFiles.length === 0 ? (
				<div
					className='text-center py-16'
					style={{ color: EXTRA_COLORS.text.muted }}
				>
					<FiInbox className='mx-auto text-5xl mb-3' />
					<p className='text-lg font-medium'>No files match your search</p>
				</div>
			) : (
				<>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
						{paginatedFiles.map((file) => {
							const cardStyle =
								"p-5 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ease-in-out block";

							return (
								<Link
									to={`/dashboard/summary`}
									state={{ file }}
									className={cardStyle}
									style={{
										backgroundColor: EXTRA_COLORS.background.paper,
										borderColor: EXTRA_COLORS.border.light,
									}}
									key={file.id}
								>
									<div className='flex items-start justify-between gap-3 mb-4'>
										<div className='flex items-center gap-3 min-w-0 flex-grow'>
											<FiFileText
												className='text-2xl flex-shrink-0'
												style={{ color: BRAND.sidebarBg }}
											/>
											<h3
												className='font-semibold text-lg truncate'
												style={{ color: EXTRA_COLORS.text.primary }}
											>
												{file.file_name || "Untitled.csv"}
											</h3>
										</div>
									</div>
									<div
										className='text-sm space-y-1'
										style={{ color: EXTRA_COLORS.text.secondary }}
									>
										<p>
											<span className='font-medium'>Type:</span>{" "}
											{file.type || "General"}
										</p>
										<p>
											<span className='font-medium'>Batch ID:</span>{" "}
											{file.batch_id}
										</p>
										<p>
											<span className='font-medium'>Total Contacts:</span>{" "}
											{Number(file.total_count || 0).toLocaleString()}
										</p>
										<p>
											<span className='font-medium'>Distinct Contacts:</span>{" "}
											{Number(file.total_distinct || 0).toLocaleString()}
										</p>
										<p className='break-words'>
											<span className='font-medium'>Message:</span>{" "}
											{file.message?.slice(0, 100)}
											{file.message && file.message.length > 100
												? "..."
												: "" || "N/A"}
										</p>
									</div>
									<div
										className='flex justify-between items-center text-xs mt-4'
										style={{ color: EXTRA_COLORS.text.muted }}
									>
										<span className='flex items-center gap-1'>
											<FiUser /> {file.full_name || "Unknown"}
										</span>
										<span className='flex items-center gap-1'>
											<FiClock /> {file.created_at}
										</span>
									</div>
								</Link>
							);
						})}
					</div>

					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className='mt-6 flex justify-center items-center gap-3'>
							<button
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className='px-3 py-1 border rounded text-sm disabled:opacity-50'
								style={{
									backgroundColor: EXTRA_COLORS.background.default,
									borderColor: EXTRA_COLORS.border.light,
									color: EXTRA_COLORS.text.primary,
								}}
							>
								Previous
							</button>
							<span style={{ color: EXTRA_COLORS.text.secondary }}>
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage === totalPages}
								className='px-3 py-1 border rounded text-sm disabled:opacity-50'
								style={{
									backgroundColor: EXTRA_COLORS.background.default,
									borderColor: EXTRA_COLORS.border.light,
									color: EXTRA_COLORS.text.primary,
								}}
							>
								Next
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default UploadedFilesList;
