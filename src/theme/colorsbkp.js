// src/theme/colors.js

/** Brand Palette */
export const BRAND = {
	sidebarBg: "#7F070F", // deep red
	activeBg: "#E3000F", // primary red for active items
	hoverBg: "#F68A8E", // lighter red/pink for hover states
	activeText: "#FFFFFF", // white text when active for better contrast
};

/** Status/Alert colors */
export const STATUS_COLORS = {
	errorBg: "#FEE2E2",
	errorBorder: "#FCA5A5",
	errorText: "#E3000F", // match brand red instead of generic red
};

/** Optional: add other shared colors */
export const EXTRA_COLORS = {
	successBg: "#DCFCE7",
	successBorder: "#86EFAC",
	successText: "#166534",

	background: {
		default: "#F9FAFB", // light gray background
		paper: "#FFFFFF", // white cards, modals, etc.
	},

	// Borders
	border: {
		light: "#636463", // use neutral gray from palette
	},

	// Text
	text: {
		primary: "#1E293B",
		secondary: "#475569",
		muted: "#94A3B8",
	},
};
