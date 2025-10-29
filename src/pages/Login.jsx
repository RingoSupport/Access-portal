import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import forge from "node-forge";
import { Eye, EyeOff } from "lucide-react";
// import { activeTheme } from './theme'; // Uncomment if using theme file

const STORAGE_PREFIX = "access_";

// Access Bank Color Theme (inline for quick testing)
const theme = {
	primary: "#EF7D00", // Access Bank Orange
	primaryDark: "#1A1A1A", // Dark Gray/Black
	primaryLight: "#FFB84D", // Light Orange
	text: "#1A1A1A", // Text color
	border: "#E0E0E0", // Border color
	bgLight: "#FFF5E6", // Light orange background
};

const LoginForm = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
        const encryptedPassword = await encryptPassword(password);
        const response = await axios.post(
            "https://accessbulk.approot.ng/login.php",
            {
                email,
                password: encryptedPassword,
            }
        );

		console.log("=== FULL RESPONSE ===");
        console.log("response.status:", response.status);
        console.log("response.data:", response.data);
        console.log("requires_otp:", response.data.requires_otp);
        console.log("otp_sent:", response.data.otp_sent);
        console.log("====================");

        console.log("API Response:", response.data); // Debug log

        // Handle OTP required case - FIRST check
        if (response.data.requires_otp || response.data.otp_sent) {
			console.log("Debug - requires_otp:", response.data.requires_otp, "otp_sent:", response.data.otp_sent);
			console.log("Debug - full response.data:", JSON.stringify(response.data, null, 2));

            if (!response.data.temp_token) {
                toast.error("Authentication error: Missing temporary token");
                console.error("Missing temp_token in response:", response.data);
                return;
            }

            sessionStorage.setItem(STORAGE_PREFIX + "temp_token", response.data.temp_token);
            sessionStorage.setItem(STORAGE_PREFIX + "email", email);

            toast.success(response.data.message || "OTP sent to your email");
            navigate("/otp");
            return; // ⚠️ CRITICAL: This stops further execution
        }

        // Handle direct login success (no OTP required) - SECOND check
        if (response.data.status === true && response.data.token) {

            toast.success("Login successful");
            localStorage.setItem(STORAGE_PREFIX + "token", response.data.token);

            if (response.data.user) {
                localStorage.setItem(STORAGE_PREFIX + "user", JSON.stringify(response.data.user));
            }

            // Clean up OTP session data
            sessionStorage.removeItem(STORAGE_PREFIX + "temp_token");
            sessionStorage.removeItem(STORAGE_PREFIX + "email");

            navigate("/portal");
            return; // ⚠️ CRITICAL: This stops further execution
        }

        // Handle failed login (neither OTP nor successful login) - LAST
        toast.error(response.data.message || "Login failed. Please try again.");

    } catch (error) {
        console.error("Login error:", error);
        toast.error("Encryption or login failed.");
    } finally {
        setLoading(false);
    }
};

	useEffect(() => {
		const token = localStorage.getItem("zenith_token");
		if (token) {
			navigate("/portal", { replace: true });
		}
			else {
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
								(e.target.style.backgroundColor = theme.primaryDark)
							}
							onMouseLeave={(e) =>
								(e.target.style.backgroundColor = theme.primary)
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
