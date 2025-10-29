import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import forge from "node-forge";
import { Eye, EyeOff } from "lucide-react";

const STORAGE_PREFIX = "access_";

const theme = {
	primary: "#EF7D00",
	primaryDark: "#1A1A1A",
	primaryLight: "#FFB84D",
	text: "#1A1A1A",
	border: "#E0E0E0",
	bgLight: "#FFF5E6",
};

const LoginForm = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	console.log("🔵 Login Component Rendered");

	const encryptPassword = async (password) => {
		try {
			const res = await fetch(
				"https://accessbulk.approot.ng/get_public_key.php"
			);
			const pem = await res.text();
			const publicKey = forge.pki.publicKeyFromPem(pem);
			const encrypted = publicKey.encrypt(password, "RSA-OAEP", {
				md: forge.md.sha1.create(),
			});
			return window.btoa(encrypted);
		} catch (error) {
			console.error("Encryption failed:", error);
			throw error;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log("🟢 LOGIN handleSubmit CALLED");
		
		if (loading) {
			console.log("⚠️ Already loading, ignoring duplicate submission");
			return;
		}
		
		setLoading(true);
		console.log("⏳ Loading set to true");

		try {
			console.log("🔐 Encrypting password...");
			const encryptedPassword = await encryptPassword(password);
			console.log("✅ Password encrypted");

			console.log("📡 Sending login request...");
			const response = await axios.post(
				"https://accessbulk.approot.ng/login.php",
				{
					email,
					password: encryptedPassword,
				}
			);

			console.log("📥 LOGIN RESPONSE:", response.data);
			console.log("🔍 requires_otp:", response.data.requires_otp);
			console.log("🔍 otp_sent:", response.data.otp_sent);
			console.log("🔍 status:", response.data.status);
			console.log("🔍 temp_token exists:", !!response.data.temp_token);

			// Check for OTP requirement FIRST
			if (response.data.requires_otp === true) {
				console.log("✅ OTP REQUIRED - Entering OTP flow");

				if (!response.data.temp_token) {
					console.log("❌ Missing temp_token");
					toast.error("Authentication error. Please try again.");
					console.error("Missing temp_token in response:", response.data);
					return;
				}

				console.log("💾 Storing temp_token in sessionStorage...");
				sessionStorage.setItem(STORAGE_PREFIX + "temp_token", response.data.temp_token);
				console.log("✅ temp_token stored:", STORAGE_PREFIX + "temp_token");

				console.log("💾 Storing email in sessionStorage...");
				sessionStorage.setItem(STORAGE_PREFIX + "email", email);
				console.log("✅ email stored:", STORAGE_PREFIX + "email");

				// Verify storage
				const storedToken = sessionStorage.getItem(STORAGE_PREFIX + "temp_token");
				const storedEmail = sessionStorage.getItem(STORAGE_PREFIX + "email");
				console.log("🔍 Verification - temp_token stored:", !!storedToken);
				console.log("🔍 Verification - email stored:", storedEmail);

				console.log("🎉 Showing success toast");
				toast.success(response.data.message || "OTP sent to your email");

				console.log("🚀 About to navigate to /otp");
				navigate("/otp");
				console.log("✨ navigate('/otp') called");
			} 
			// Handle direct login (no OTP)
			else if (response.data.status === true && response.data.token) {
				console.log("✅ DIRECT LOGIN - No OTP required");

				toast.success("Login successful");
				
				console.log("💾 Storing token in localStorage...");
				localStorage.setItem(STORAGE_PREFIX + "token", response.data.token);
				
				if (response.data.user) {
					console.log("💾 Storing user data...");
					localStorage.setItem(STORAGE_PREFIX + "user", JSON.stringify(response.data.user));
				}
				
				console.log("🧹 Clearing session storage...");
				sessionStorage.removeItem(STORAGE_PREFIX + "temp_token");
				sessionStorage.removeItem(STORAGE_PREFIX + "email");
				
				console.log("🚀 Navigating to /portal");
				navigate("/portal");
			} 
			// Handle error response
			else {
				console.log("❌ INVALID RESPONSE - Neither OTP nor direct login");
				console.log("❌ Full response.data:", response.data);
				toast.error(response.data.message || "Invalid credentials.");
			}

		} catch (error) {
			console.error("❌ LOGIN ERROR:", error);
			
			if (error.response) {
				console.error("❌ Server error response:", error.response.data);
				toast.error(error.response.data?.message || "Login failed. Please try again.");
			} else if (error.request) {
				console.error("❌ No response from server");
				toast.error("Cannot reach server. Please check your connection.");
			} else {
				console.error("❌ Request setup error:", error.message);
				toast.error("An error occurred. Please try again.");
			}
		} finally {
			console.log("🏁 Finally block - setting loading to false");
			setLoading(false);
		}
	};

		useEffect(() => {
			console.log("🔄 LOGIN useEffect triggered");
			
			const token = localStorage.getItem(STORAGE_PREFIX + "token");
			console.log("🔍 Checking for existing token:", !!token);
			
			if (token) {
				console.log("✅ Token exists - redirecting to portal");
				navigate("/portal", { replace: true });  // ⬅️ ADD THIS LINE
				console.log("🚀 Navigated to portal");
			} else {
				console.log("🧹 No token - cleaning up session storage");
				sessionStorage.removeItem(STORAGE_PREFIX + "temp_token");
				sessionStorage.removeItem(STORAGE_PREFIX + "email");
			}
		}, [navigate]);

	return (
		<div
			className='min-h-screen flex items-center justify-center bg-white font-inter'
			style={{ color: theme.text }}
		>
			<div
				className='flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden'
				style={{ border: `1px solid ${theme.border}` }}
			>
				{/* Left SVG Illustration */}
				<div
					className='hidden md:flex w-1/2 items-center justify-center p-8'
					style={{ backgroundColor: theme.bgLight }}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 512'
						className='w-3/4 h-auto'
					>
						<path
							fill={theme.primary}
							d='M320 64c-88.37 0-160 71.63-160 160v48h-24c-13.25 0-24 10.75-24 24v192c0 13.25 10.75 24 24 24h368c13.25 0 24-10.75 24-24V296c0-13.25-10.75-24-24-24h-24v-48c0-88.37-71.63-160-160-160zm0 48c61.86 0 112 50.14 112 112v48H208v-48c0-61.86 50.14-112 112-112z'
						/>
					</svg>
				</div>

				{/* Right Login Form */}
				<div className='w-full md:w-1/2 p-8'>
					<h2 className='text-3xl font-bold text-center mb-6'>
						SMS Portal Login
					</h2>
					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Email */}
						<div>
							<label
								htmlFor='email'
								className='block font-medium'
								style={{ color: theme.text }}
							>
								Email
							</label>
							<input
								type='email'
								id='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className='w-full p-3 mt-2 rounded-md focus:outline-none focus:ring-2'
								style={{
									border: `1px solid ${theme.border}`,
									"--tw-ring-color": theme.primary,
								}}
								required
							/>
						</div>

						{/* Password with toggle */}
						<div>
							<label
								htmlFor='password'
								className='block font-medium'
								style={{ color: theme.text }}
							>
								Password
							</label>
							<div className='relative'>
								<input
									type={showPassword ? "text" : "password"}
									id='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full p-3 mt-2 rounded-md focus:outline-none focus:ring-2 pr-10'
									style={{
										border: `1px solid ${theme.border}`,
										"--tw-ring-color": theme.primary,
									}}
									required
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute inset-y-0 right-3 flex items-center'
									style={{ color: theme.text }}
								>
									{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
						</div>

						{/* Submit */}
						<button
							type='submit'
							disabled={loading}
							className='w-full py-3 mt-4 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
							style={{
								backgroundColor: theme.primary,
								"--tw-ring-color": theme.primaryLight,
							}}
							onMouseEnter={(e) =>
								!loading && (e.target.style.backgroundColor = theme.primaryDark)
							}
							onMouseLeave={(e) =>
								!loading && (e.target.style.backgroundColor = theme.primary)
							}
						>
							{loading ? "Signing In..." : "Sign In"}
						</button>
					</form>

					{/* Forgot Password */}
					<div className='mt-4 text-center'>
						<a
							href='/forgot-password'
							className='text-sm hover:underline'
							style={{ color: theme.primary }}
						>
							Forgot Password?
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;