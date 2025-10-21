import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SendSmsPage = () => {
	const [msisdn, setMsisdn] = useState("");
	const [text, setText] = useState("");
	const [groupId, setGroupId] = useState(""); // Added group ID state
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();
	const [groups, setGroups] = useState([]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem("zenith_token");

			const response = await axios.post(
				"https://accessbulk.approot.ng/send_sms.php", //  Endpoint
				{ msisdn, text, group_id: groupId }, // Include group_id
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
				setError(response.data.message || "Failed to send SMS");
			}
		} catch (err) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchGroups = async () => {
			try {
				const token = localStorage.getItem("zenith_token");
				const response = await axios.get(
					"https://accessbulk.approot.ng//list_groups.php",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
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

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
			<div className='w-full max-w-lg bg-white p-8 rounded-lg shadow-md'>
				<h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>
					Send SMS
				</h2>

				{error && (
					<div className='mb-4 text-sm text-red-600 text-center border border-red-500 rounded-md p-2 bg-red-100'>
						<span className='font-semibold'>Error: </span>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label
							htmlFor='msisdn'
							className='block text-sm font-medium text-gray-700'
						>
							MSISDN (Phone Number)
						</label>
						<input
							id='msisdn'
							type='text'
							value={msisdn}
							onChange={(e) => setMsisdn(e.target.value)}
							placeholder='e.g., 2348012345678'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
							required
						/>
					</div>
					<div>
						<label
							htmlFor='text'
							className='block text-sm font-medium text-gray-700'
						>
							Text Message
						</label>
						<textarea
							id='text'
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder='Enter your SMS message here...'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
							rows={4}
							required
						/>
					</div>
					<div className='mb-4'>
						<label
							htmlFor='group_id'
							className='block text-sm font-medium text-gray-700'
						>
							Select SMS Group (Optional)
						</label>
						<select
							id='group_id'
							value={groupId}
							onChange={(e) => setGroupId(e.target.value)}
							className='mt-1 block w-full p-2 border border-gray-300 rounded'
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

					<button
						type='submit'
						disabled={loading}
						className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50'
					>
						{loading ? "Sending..." : "Send SMS"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default SendSmsPage;
