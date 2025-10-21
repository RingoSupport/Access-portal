import { addHours, format } from "date-fns";
import { enUS } from "date-fns/locale"; // optional locale

// helper
export const formatToLagos = (dateString, addHour = false) => {
	if (!dateString) return "N/A";
	const parsed = new Date(dateString);
	const shifted = addHour ? addHours(parsed, 1) : parsed;
	return format(shifted, "yyyy-MM-dd HH:mm:ss", { locale: enUS });
};
