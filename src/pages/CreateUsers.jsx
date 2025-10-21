import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const colors = {
	errorBg: "#FEE2E2",
	errorBorder: "#FCA5A5",
	errorText: "#DC2626",
	bgWhite: "#FFFFFF",
	primary: "#EF7D00", // 🔴 brand red
	primaryHover: "#FFB84D", // 🟥 darker red hover
	accent: "#F68A8E", // 🌸 soft accent
	textDark: "#7F070F", // 🟥 deep shade for titles
	textGray: "#636463", // ⚫ neutral gray for labels
	border: "#636463", // ⚫ neutral gray borders
	bgLight: "#FFB84D", // background light
};

const CreateUserPage = () => {
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [role, setRole] = useState("");
	const [password, setPassword] = useState("");

	const currentRole = localStorage.getItem("role");

	const handleCreateUser = async (e) => {
		e.preventDefault();

		try {
			const payload = {
				email,
				role,
				password,
				full_name: fullName,
			};

			const token = localStorage.getItem("zenith_token");

			const response = await axios.post(
				"https://accessbulk.approot.ng//create_user.php",
				payload,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.status) {
				toast.success("User created successfully!");
				setEmail("");
				setPassword("");
				setFullName("");
				setRole("");
			} else {
				toast.error(response.data.message || "Failed to create user.");
			}
		} catch (error) {
			toast.error("An error occurred. Please try again later.");
		}
	};

	const allowedRoles = [
		{ value: "admin", label: "Admin" },
		{ value: "customer_support", label: "Customer Support" },
		{ value: "technical_support", label: "Technical Support" },
	];

	if (currentRole === "super_admin") {
		allowedRoles.unshift({ value: "super_admin", label: "Super Admin" });
	}

	return (
		<div
			className='min-h-screen flex items-center justify-center'
			style={{ backgroundColor: colors.bgLight }}
		>
			<div
				className='max-w-md w-full p-8 rounded-lg shadow-lg'
				style={{ backgroundColor: colors.bgWhite }}
			>
				<h2
					className='text-3xl font-semibold text-center mb-6'
					style={{ color: colors.primary }}
				>
					Create User
				</h2>
				<form onSubmit={handleCreateUser} className='space-y-6'>
					<div>
						<label
							htmlFor='fullname'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Full Name
						</label>
						<input
							type='text'
							id='fullname'
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						/>
					</div>
					<div>
						<label
							htmlFor='email'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Email
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						/>
					</div>
					<div>
						<label
							htmlFor='role'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Role
						</label>
						<select
							id='role'
							value={role}
							onChange={(e) => setRole(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						>
							<option value=''>Select Role</option>
							{allowedRoles.map((r) => (
								<option key={r.value} value={r.value}>
									{r.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							htmlFor='password'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Password
						</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						/>
					</div>
					<button
						type='submit'
						className='w-full py-3 mt-4 font-semibold rounded-lg focus:outline-none'
						style={{
							backgroundColor: colors.primary,
							color: colors.bgWhite,
						}}
						onMouseOver={(e) =>
							(e.currentTarget.style.backgroundColor = colors.primaryHover)
						}
						onMouseOut={(e) =>
							(e.currentTarget.style.backgroundColor = colors.primary)
						}
					>
						Create User
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateUserPage;
