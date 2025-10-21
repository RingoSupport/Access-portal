// src/theme/colors.js

/** Brand Palette - Access Bank */
export const BRAND = {
	sidebarBg: "#1A1A1A",     // dark gray/black for sidebar
	activeBg: "#EF7D00",      // Access Bank orange for active items
	hoverBg: "#FFB84D",       // lighter orange for hover states
	activeText: "#FFFFFF",    // white text when active for better contrast
};

/** Status/Alert colors */
export const STATUS_COLORS = {
	errorBg: "#FEE2E2",
	errorBorder: "#FCA5A5",
	errorText: "#DC2626",     // standard red for errors (not brand color)
};

/** Optional: add other shared colors */
export const EXTRA_COLORS = {
	successBg: "#DCFCE7",
	successBorder: "#86EFAC",
	successText: "#166534",

	background: {
		default: "#F9FAFB",   // light gray background
		paper: "#FFFFFF",     // white cards, modals, etc.
		lightOrange: "#FFF5E6", // light orange accent background
	},

	// Borders
	border: {
		light: "#E0E0E0",     // light gray borders
		medium: "#BDBDBD",    // medium gray for emphasis
	},

	// Text
	text: {
		primary: "#1A1A1A",   // dark gray/black for primary text
		secondary: "#475569", // medium gray for secondary text
		muted: "#94A3B8",     // light gray for muted text
	},
};

/** Complete Access Bank Theme Object (for consistency with inline usage) */
export const ACCESS_THEME = {
	primary: "#EF7D00",       // Access Bank Orange
	primaryDark: "#1A1A1A",   // Dark Gray/Black
	primaryLight: "#FFB84D",  // Light Orange
	text: "#1A1A1A",          // Text color
	border: "#E0E0E0",        // Border color
	bgLight: "#FFF5E6",       // Light orange background
};

/** Export all as default for easier imports */
export default {
	BRAND,
	STATUS_COLORS,
	EXTRA_COLORS,
	ACCESS_THEME,
};