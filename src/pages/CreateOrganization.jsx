// src/pages/CreateOrganizationPage.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const CreateOrganizationPage = () => {
	const [orgName, setOrgName] = useState("");
	const [orgEmail, setOrgEmail] = useState("");

	const handleCreateOrganization = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post(
				"https://accessbulk.approot.ng/create_organization.php",
				{
					orgName,
					orgEmail,
				}
			);

			if (response.data.status) {
				toast.success("Organization created successfully!");
			} else {
				toast.error(response.data.message || "Failed to create organization.");
			}
		} catch (error) {
			toast.error("An error occurred. Please try again later.");
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='max-w-md w-full bg-white p-8 rounded-lg shadow-lg'>
				<h2 className='text-3xl font-semibold text-center text-red-600 mb-6'>
					Create Organization
				</h2>
				<form onSubmit={handleCreateOrganization} className='space-y-6'>
					<div>
						<label
							htmlFor='orgName'
							className='block text-gray-700 font-medium'
						>
							Organization Name
						</label>
						<input
							type='text'
							id='orgName'
							value={orgName}
							onChange={(e) => setOrgName(e.target.value)}
							className='w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
							required
						/>
					</div>
					<div>
						<label
							htmlFor='orgEmail'
							className='block text-gray-700 font-medium'
						>
							Organization Email
						</label>
						<input
							type='email'
							id='orgEmail'
							value={orgEmail}
							onChange={(e) => setOrgEmail(e.target.value)}
							className='w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
							required
						/>
					</div>
					<button
						type='submit'
						className='w-full py-3 mt-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
					>
						Create Organization
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateOrganizationPage;
