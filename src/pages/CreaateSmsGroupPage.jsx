// src/pages/CreateSmsGroupPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateSmsGroupPage = () => {
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem("zenith_token");

			const response = await axios.post(
				"https://accessbulk.approot.ng//create_sms_group.php",
				{ name },
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.status) {
				navigate("/portal"); // success
			} else {
				setError(response.data.message || "Failed to create group");
			}
		} catch (err) {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
			<div className='w-full max-w-lg bg-white p-8 rounded-lg shadow-md'>
				<h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>
					Create SMS Group
				</h2>

				{error && (
					<div className='mb-4 text-sm text-red-600 text-center'>{error}</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label
							htmlFor='name'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Group Name
						</label>
						<input
							id='name'
							type='text'
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='e.g. Lagos Customers'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
							required
						/>
					</div>

					<button
						type='submit'
						disabled={loading}
						className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50'
					>
						{loading ? "Creating..." : "Create Group"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateSmsGroupPage;
