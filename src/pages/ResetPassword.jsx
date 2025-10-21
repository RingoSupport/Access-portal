import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const email = searchParams.get("email");
	const token = searchParams.get("token");

	const [form, setForm] = useState({ password: "", confirmPassword: "" });
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async () => {
		if (!form.password || !form.confirmPassword) {
			return toast.error("Both fields are required.");
		}
		if (form.password !== form.confirmPassword) {
			return toast.error("Passwords do not match.");
		}

		try {
			setLoading(true);
			const res = await axios.post(
				"https://accessbulk.approot.ng/request_reset_password.php",
				{
					email,
					token,
					password: form.password,
				}
			);

			if (res.data.status === "success") {
				toast.success("Password reset successful");
				setTimeout(() => {
					navigate("/login");
				}, 1500);
			} else {
				toast.error(res.data.message || "Failed to reset password");
			}
		} catch (err) {
			toast.error("Server error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='bg-white shadow-md rounded-lg p-8 w-full max-w-md'>
				<h2 className='text-2xl font-bold mb-4 text-[#7F5C0A]'>
					Reset Password
				</h2>
				<input
					type='password'
					name='password'
					placeholder='New Password'
					value={form.password}
					onChange={handleChange}
					className='w-full p-2 border border-gray-300 rounded mb-4'
				/>
				<input
					type='password'
					name='confirmPassword'
					placeholder='Confirm Password'
					value={form.confirmPassword}
					onChange={handleChange}
					className='w-full p-2 border border-gray-300 rounded mb-4'
				/>
				<button
					onClick={handleSubmit}
					disabled={loading}
					className='w-full bg-[#FDB813] text-white font-bold py-2 rounded hover:bg-[#eaa400]'
				>
					{loading ? "Resetting..." : "Reset Password"}
				</button>
			</div>
		</div>
	);
}
