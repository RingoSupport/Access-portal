import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AiFillDashboard } from "react-icons/ai";
import {
	MdLogout,
	MdPeople,
	MdInsertDriveFile,
	MdExpandMore,
} from "react-icons/md";
import {
	FiUpload,
	FiFileText,
	FiGrid,
	FiMenu,
	FiSend,
	FiSearch,
	FiFolderPlus,
	FiBarChart2,
	FiUserPlus,
	FiShield,
	FiLayers,
	FiMail,
} from "react-icons/fi";
import {
	HiOutlineShieldCheck,
	HiOutlineGlobeAlt,
	HiOutlineDocumentText,
} from "react-icons/hi2";
import { RiMessage2Line } from "react-icons/ri";
import { BsShield, BsGlobe } from "react-icons/bs";
import { useContext, useMemo, useState, useEffect } from "react";
import { decryptData } from "../utils/crypto";
import { BRAND, ACCESS_THEME } from "../theme/colors";


const BRAND_COLORS = {
	primary: ACCESS_THEME.primary,
	secondary: ACCESS_THEME.primaryLight,
	dark: ACCESS_THEME.primary, 
	textMuted: "#636463",
	showdark: "#636463",
	white: "#fff",
	black: "#000",
};

export default function DashboardLayout() {
	const { logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();

	const [showSidebar, setShowSidebar] = useState(() => {
		const saved = localStorage.getItem("sidebarVisible");
		return saved !== null ? JSON.parse(saved) : true;
	});

	const [openDropdown, setOpenDropdown] = useState(() => {
		const saved = localStorage.getItem("openDropdown");
		return saved ? JSON.parse(saved) : null;
	});

	useEffect(() => {
		localStorage.setItem("sidebarVisible", JSON.stringify(showSidebar));
	}, [showSidebar]);

	useEffect(() => {
		localStorage.setItem("openDropdown", JSON.stringify(openDropdown));
	}, [openDropdown]);

	useEffect(() => {
		const currentPath = location.pathname;

		navItems.forEach((item) => {
			if (item.children) {
				const isChildActive = item.children.some((child) =>
					currentPath.startsWith(`/${child.path}`)
				);

				if (isChildActive && openDropdown !== item.label) {
					setOpenDropdown(item.label);
				}
			}
		});
	}, [location.pathname]);

	const handleLogout = () => {
		localStorage.removeItem("sidebarVisible");
		localStorage.removeItem("openDropdown");
		logout("Session Expired");
		navigate("/login");
	};

	const encryptedRole = localStorage.getItem("xAI789");
	const role = encryptedRole ? decryptData(encryptedRole) : null;

	const navItems = useMemo(
		() => [
			{ label: "Dashboard", icon: <AiFillDashboard />, path: "portal" },
			{
				label: "Messages",
				icon: <RiMessage2Line />,
				path: "sms",
			},
			{
				label: "OTP Messages",
				icon: <HiOutlineShieldCheck />,
				path: "otpsms",
			},
			{
				label: "Bulk Messages",
				icon: <FiMail />,
				path: "bulksms",
			},
			{
				label: "International Messages",
				icon: <HiOutlineGlobeAlt />,
				path: "international",
			},
			{
				label: "International OTP Messages",
				icon: <BsShield />,
				path: "international-otp",
			},
			{
				label: "International Country Log",
				icon: <BsGlobe />,
				path: "international-country-log",
			},
			{
				label: "Bulk SMS",
				icon: <FiLayers />,
				children: [
					{ label: "Dashboard", icon: <FiGrid />, path: "bulksms/dashboard" },
					{
						label: "Upload File",
						icon: <FiUpload />,
						path: "dashboard/send-multiple-sms",
					},
					{
						label: "Uploaded Files",
						icon: <FiFileText />,
						path: "dashboard/uploaded_files",
						roles: ["admin", "super_admin"],
					},
					{ label: "Search", icon: <FiSearch />, path: "dashboard/search" },
					{
						label: "Create SMS Category",
						icon: <FiFolderPlus />,
						path: "dashboard/categories",
					},
					{ label: "Sent Messages", icon: <FiSend />, path: "dashboard/sent" },
					{
						label: "Summary",
						icon: <FiBarChart2 />,
						path: "dashboard/message-summary",
					},
					{
						label: "Logs",
						icon: <MdInsertDriveFile />,
						path: "dashboard/logs",
					},
				],
			},
			{
				label: "Users",
				icon: <MdPeople />,
				path: "dashboard/users",
				roles: ["admin", "super_admin"],
			},
			{
				label: "Create User",
				icon: <FiUserPlus />,
				path: "dashboard/create_user",
				roles: ["admin", "super_admin"],
			},
			{ label: "Logs", icon: <HiOutlineDocumentText />, path: "logs" },
			{
				label: "Audit Logs",
				icon: <FiShield />,
				path: "audit-logs",
			},
		],
		[role]
	);

	const toggleDropdown = (label) => {
		setOpenDropdown((prev) => (prev === label ? null : label));
	};

	const isSectionActive = (children = []) =>
		children.some((c) => location.pathname.startsWith(`/${c.path}`));

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<div
				className={`transition-all duration-300 ${
					showSidebar ? "w-64" : "w-16"
				} text-white flex-shrink-0 sticky top-0 h-screen overflow-y-auto`}
				style={{ backgroundColor: BRAND_COLORS.dark }}
			>
				<div className='p-4 flex items-center justify-between'>
					<span className='text-white font-bold text-xl flex items-center gap-2'>
						<AiFillDashboard style={{ color: BRAND_COLORS.secondary }} />
						{showSidebar && "ACCESS"}
					</span>
					<button
						className='md:hidden text-white'
						onClick={() => setShowSidebar(!showSidebar)}
					>
						<FiMenu size={20} />
					</button>
				</div>

				<nav className='flex flex-col mt-6 space-y-1'>
					{navItems
						.filter((item) => !item.roles || item.roles.includes(role))
						.map((item, idx) => {
							const isDropdown = !!item.children;
							const parentActive =
								(!isDropdown && location.pathname === `/${item.path}`) ||
								(isDropdown && isSectionActive(item.children));

							return (
								<div
									key={idx}
									className={`${
										parentActive
											? `bg-black text-white`
											: `hover:bg-[${BRAND_COLORS.secondary}] text-white`
									}}`}
								>
									<div
										onClick={() =>
											isDropdown
												? toggleDropdown(item.label)
												: navigate(item.path)
										}
										className={`flex items-center justify-between px-6 py-3 cursor-pointer transition font-medium
                                        ${
																					parentActive
																						? `bg-[${BRAND_COLORS.black}] text-[${BRAND_COLORS.white}]`
																						: `hover:bg-[${BRAND_COLORS.primary}] text-white`
																				}
                                        `}
									>
										<div className='flex items-center'>
											<span className='text-xl'>{item.icon}</span>
											{showSidebar && (
												<span className='ml-3 truncate text-sm'>
													{item.label}
												</span>
											)}
										</div>
										{isDropdown && showSidebar && (
											<span
												className={`transition-transform duration-200 ${
													openDropdown === item.label ? "rotate-180" : ""
												}`}
											>
												<MdExpandMore size={20} />
											</span>
										)}
									</div>

									{isDropdown && openDropdown === item.label && showSidebar && (
										<div className='ml-3 mr-2 mt-1 rounded-lg ' style={{ backgroundColor: BRAND_COLORS.dark }}>
											<div className='py-2'>
												{item.children
													.filter(
														(sub) => !sub.roles || sub.roles.includes(role)
													)
													.map((subItem, subIdx) => (
														<NavLink
	key={subIdx}
	to={`/${subItem.path}`}
	className="flex items-center gap-3 px-5 py-2.5 text-sm rounded-md mx-2 my-0.5 transition border-l-4"
	style={({ isActive }) => ({
		backgroundColor: isActive
			? BRAND_COLORS.primary // Active = Access Orange
			: "transparent",
		color: BRAND_COLORS.white, // White text for submenu
		borderColor: isActive
			? BRAND_COLORS.secondary // Lighter orange border
			: "transparent",
	})}
	onMouseEnter={(e) => {
		if (!e.currentTarget.classList.contains("active")) {
			e.currentTarget.style.backgroundColor = BRAND_COLORS.secondary; // Hover = lighter orange
		}
	}}
	onMouseLeave={(e) => {
		if (!e.currentTarget.classList.contains("active")) {
			e.currentTarget.style.backgroundColor = "transparent";
		}
	}}
	end={false}
>
	<span className="text-base leading-none">
		{subItem.icon ?? <FiSend className="text-base" />}
	</span>
	<span className="truncate">{subItem.label}</span>
</NavLink>

													))}
											</div>
										</div>
									)}
								</div>
							);
						})}
				</nav>
			</div>

			<div className='flex-1 flex flex-col overflow-hidden'>
				<header className='flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b flex-shrink-0'>
					<h1
						className='text-xl font-semibold'
						style={{ color: BRAND_COLORS.dark }}
					>
						{location.pathname.replace("/", "").toUpperCase() || "DASHBOARD"}
					</h1>
					<div className='flex items-center gap-4'>
						<span
							className='hidden md:inline text-sm'
							style={{ color: BRAND_COLORS.textMuted }}
						>
							Welcome, Admin
						</span>
						<button
							onClick={handleLogout}
							className='flex items-center gap-2 px-3 py-2 text-sm text-white rounded'
							style={{
								backgroundColor: BRAND_COLORS.primary,
								transition: "background-color 0.3s ease-in-out",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = BRAND_COLORS.dark)
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = BRAND_COLORS.primary)
							}
						>
							<MdLogout size={18} />
							<span className='hidden sm:inline'>Logout</span>
						</button>
					</div>
				</header>

				<main className='flex-1 p-6 bg-gray-50 overflow-y-auto overflow-x-auto'>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
