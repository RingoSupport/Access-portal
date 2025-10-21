import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

const ManageMessageCategories = () => {
	const [categoryName, setCategoryName] = useState("");
	const [id, setId] = useState(""); // for update/delete
	const [mode, setMode] = useState("create"); // create, read, update, delete
	const [categories, setCategories] = useState([]);

	const token = localStorage.getItem("zenith_token");
	const fetchCategories = async () => {
		try {
			const token = localStorage.getItem("zenith_token");

			const formData = new FormData();
			formData.append("action", "read");
			const res = await axios.post(
				"https://accessbulk.approot.ng/Messages.php",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (res.data.status && Array.isArray(res.data.data)) {
				setCategories(res.data.data);
			} else {
				toast.error("Failed to fetch categories.");
			}
		} catch (err) {
			console.error(err);
			toast.error("Error fetching categories.");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		const endpoint = "https://accessbulk.approot.ng/Messages.php";

		switch (mode) {
			case "create":
				formData.append("action", "create");
				formData.append("category_name", categoryName);
				break;
			case "update":
				formData.append("action", "update");
				formData.append("category_name", categoryName);
				formData.append("id", id);
				break;
			case "delete":
				formData.append("action", "delete");
				formData.append("id", id);
				break;
			default:
				return;
		}

		try {
			const res = await axios.post(endpoint, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.data.status) {
				toast.success(res.data.message || "Operation successful");
				fetchCategories();
				setCategoryName("");
				setId("");
			} else {
				toast.error(res.data.message || "Operation failed");
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred");
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	return (
		<div
			className='max-w-md mx-auto mt-10 p-6 shadow rounded'
			style={{
				backgroundColor: EXTRA_COLORS.background.paper,
				border: `1px solid ${EXTRA_COLORS.border.light}`,
			}}
		>
			<h2
				className='text-xl font-semibold mb-4 text-center'
				style={{ color: EXTRA_COLORS.text.primary }}
			>
				Manage Message Categories
			</h2>

			<div className='mb-4'>
				<label
					className='block font-medium mb-1'
					style={{ color: EXTRA_COLORS.text.secondary }}
				>
					Mode
				</label>
				<select
					value={mode}
					onChange={(e) => setMode(e.target.value)}
					className='w-full p-2 rounded'
					style={{
						border: `1px solid ${EXTRA_COLORS.border.light}`,
						backgroundColor: EXTRA_COLORS.background.default,
						color: EXTRA_COLORS.text.primary,
					}}
				>
					<option value='create'>Create</option>
					<option value='update'>Update</option>
					<option value='delete'>Delete</option>
				</select>
			</div>

			{mode === "create" && (
				<input
					type='text'
					className='p-2 mb-10 w-full outline-none rounded'
					value={categoryName}
					onChange={(e) => setCategoryName(e.target.value)}
					placeholder='Set Category Name'
					style={{
						border: `1px solid ${EXTRA_COLORS.border.light}`,
						backgroundColor: EXTRA_COLORS.background.default,
						color: EXTRA_COLORS.text.primary,
					}}
				/>
			)}

			{mode === "update" && (
				<div className='mb-4'>
					<label
						className='block font-medium mb-1'
						style={{ color: EXTRA_COLORS.text.secondary }}
					>
						Select Category
					</label>
					<select
						className='p-2 mb-4 w-full outline-none rounded'
						value={id}
						onChange={(e) => setId(e.target.value)}
						style={{
							border: `1px solid ${EXTRA_COLORS.border.light}`,
							backgroundColor: EXTRA_COLORS.background.default,
							color: EXTRA_COLORS.text.primary,
						}}
					>
						<option value=''>Select A category</option>
						{categories.map((item, id) => (
							<option key={id} value={item.id}>
								{item.category_name}
							</option>
						))}
					</select>
					<input
						type='text'
						className='p-2 mb-10 w-full outline-none rounded'
						value={categoryName}
						onChange={(e) => setCategoryName(e.target.value)}
						placeholder='Set Category Name'
						style={{
							border: `1px solid ${EXTRA_COLORS.border.light}`,
							backgroundColor: EXTRA_COLORS.background.default,
							color: EXTRA_COLORS.text.primary,
						}}
					/>
				</div>
			)}

			{mode === "delete" && (
				<div className='mb-4'>
					<label
						className='block font-medium mb-1'
						style={{ color: EXTRA_COLORS.text.secondary }}
					>
						Select Category
					</label>
					<select
						className='p-2 mb-10 w-full outline-none rounded'
						value={id}
						onChange={(e) => setId(e.target.value)}
						style={{
							border: `1px solid ${EXTRA_COLORS.border.light}`,
							backgroundColor: EXTRA_COLORS.background.default,
							color: EXTRA_COLORS.text.primary,
						}}
					>
						<option value=''>Select A category</option>
						{categories.map((item, index) => (
							<option key={index} value={item.id}>
								{item.category_name}
							</option>
						))}
					</select>
				</div>
			)}

			<button
				onClick={handleSubmit}
				className='w-full py-2 rounded hover:opacity-90'
				style={{
					backgroundColor: BRAND.activeBg,
					color: "#fff",
				}}
			>
				Submit
			</button>
		</div>
	);
};

export default ManageMessageCategories;
