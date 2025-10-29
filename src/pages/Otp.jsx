import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { encryptData } from "../utils/crypto";
import { AiFillBank } from "react-icons/ai";

const STORAGE_PREFIX = "access_";

const GENERATE_TOKEN_URL = "https://bulkaccess.approot.ng/generatetoken.php";
const OTP_VERIFY_URL = "https://accessbulk.approot.ng/otp.php";

const theme = {
	primary: "#EF7D00",
	primaryDark: "#1A1A1A",
	primaryLight: "#FFB84D",
	text: "#1A1A1A",
	border: "#E0E0E0",
	bgLight: "#FFF5E6",
};

const SecureAccessSVG = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 500 500'
		className='w-72 h-auto'
	>
		<rect width='500' height='500' rx='40' fill={theme.primaryDark} />
		<path
			d='M250 90 L360 140 V250 C360 310 310 380 250 410 C190 380 140 310 140 250 V140 Z'
			fill={theme.primary}
		/>
		<circle cx='250' cy='220' r='40' fill='white' />
		<rect x='235' y='220' width='30' height='55' rx='6' fill='white' />
		<circle cx='170' cy='330' r='10' fill='white' />
		<circle cx='220' cy='330' r='10' fill='white' />
		<circle cx='270' cy='330' r='10' fill='white' />
		<circle cx='320' cy='330' r='10' fill='white' />
		<text
			x='250'
			y='470'
			fontFamily='Arial, sans-serif'
			fontSize='28'
			fontWeight='bold'
			fill='white'
			textAnchor='middle'
		>
			Verify OTP
		</text>
	</svg>
);

const OtpPage = () => {
	const navigate = useNavigate();
	const { login } = useContext(AuthContext);

	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);

	const email = sessionStorage.getItem(STORAGE_PREFIX + "email");
    const tempToken = sessionStorage.getItem(STORAGE_PREFIX + "temp_token");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		

		if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
			toast.error("Please enter a valid 6-digit OTP");
			return;
		}

		if (!tempToken) {
			toast.error("Session expired. Please login again.");
			navigate("/login", { replace: true });
			return;
		}

		try {
			const { data } = await axios.post(
				OTP_VERIFY_URL,
				{ otp },
				{ headers: { Authorization: `Bearer ${tempToken}` } }
			);

			if (data.status === "true") {
				if (!data.token) {
					toast.error("Authentication error. Please try again.");
					console.error("Missing token in successful response:", data);
					return;
				}

				localStorage.setItem(STORAGE_PREFIX + "token", data.token);
				if (data.user) {
					localStorage.setItem(STORAGE_PREFIX + "user", JSON.stringify(data.user));
					
					// Encrypt and store role if needed
					if (data.user.role) {
						const encryptedRole = encryptData(data.user.role);
						localStorage.setItem(STORAGE_PREFIX + "role", encryptedRole);
					}
				}

				
				sessionStorage.removeItem(STORAGE_PREFIX + "temp_token");
				sessionStorage.removeItem(STORAGE_PREFIX + "email");

				
				login(data.token, data.user || data, data.user?.role, email);

				toast.success("Authentication successful!");
				navigate("/portal", { replace: true });
			} else {
				const msg = data.message || "Invalid OTP.";
				toast.error(msg);
				localStorage.clear();
				sessionStorage.clear();

				if (msg.toLowerCase().includes("otp has expired")) {
					toast.info("Your OTP has expired. Please log in again.");
				}
				navigate("/");
			}
		} catch (err) {
			console.error("OTP verification error:", err);
			toast.error("Verification failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
			const fullToken = localStorage.getItem(STORAGE_PREFIX + "token");
		if (fullToken) {
			navigate("/portal", { replace: true });
			return;
		}
			if (!email || !tempToken) {
			toast.error("Please login first");
			navigate("/login", { replace: true });
			return;
		}

			try {
			// Decode JWT to check expiry (without verification)
			const payload = JSON.parse(atob(tempToken.split('.')[1]));
			const isExpired = payload.exp && payload.exp < Date.now() / 1000;
			
			if (isExpired) {
				toast.error("Session expired. Please login again.");
				sessionStorage.clear();
				navigate("/login", { replace: true });
			}
		} catch (e) {
			// If token is malformed, send back to login
			console.error("Invalid temp_token format:", e);
			toast.error("Invalid session. Please login again.");
			sessionStorage.clear();
			navigate("/login", { replace: true });
		}

	}, [navigate, email, tempToken]);
	

	return (
		<div
			className='min-h-screen flex flex-col items-center bg-white font-inter'
			style={{ color: theme.text }}
		>
			{/* Header */}
			<div className='py-6 text-center flex items-center justify-center gap-2 text-3xl font-bold'>
				<AiFillBank style={{ color: theme.primary }} />
				<span>ACCESS BANK</span>
			</div>

			{/* Content */}
			<div className='flex flex-1 flex-col md:flex-row items-center justify-center p-6 w-full max-w-6xl'>
				{/* SVG Side */}
				<div
					className='hidden md:flex w-full md:w-1/2 rounded-lg shadow-lg overflow-hidden p-6 mr-6 items-center justify-center'
					style={{ backgroundColor: theme.bgLight }}
				>
					<SecureAccessSVG />
				</div>

				{/* Form Side */}
				<div className='w-full md:w-1/2 flex items-center justify-center p-6 bg-white rounded-lg shadow-lg'>
					<div className='w-full max-w-md'>
						<h2
							className='text-3xl font-extrabold mb-6 text-center'
							style={{ color: theme.text }}
						>
							Verify OTP
						</h2>
						<p className='text-base text-gray-700 text-center mb-6'>
							An OTP was sent to{" "}
							<strong style={{ color: theme.primary }}>
								{email || "your email"}
							</strong>
							. It will expire in 5 minutes.
						</p>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<input
								id='otp'
								type='text'
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								placeholder='Enter OTP'
								className='w-full px-5 py-3 rounded-lg focus:outline-none focus:ring-2 transition duration-200 ease-in-out text-lg'
								style={{
									border: `1px solid ${theme.border}`,
									"--tw-ring-color": theme.primary,
								}}
								required
								maxLength='6'
								pattern='\d{6}'
								title='Please enter a 6-digit OTP'
							/>
							<button
								type='submit'
								disabled={loading}
								className='w-full py-3 text-white font-bold rounded-lg focus:outline-none focus:ring-2 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
								style={{
									backgroundColor: theme.primary,
									"--tw-ring-color": theme.primaryLight,
								}}
								onMouseEnter={(e) =>
									!loading &&
									(e.target.style.backgroundColor = theme.primaryDark)
								}
								onMouseLeave={(e) =>
									!loading && (e.target.style.backgroundColor = theme.primary)
								}
							>
								{loading ? "Verifying…" : "Verify OTP"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OtpPage;
