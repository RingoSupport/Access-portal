export function getNetwork(number) {
	// Replace leading "234" with "0"
	number = number.replace(/^234/, "0");

	// Get first 5 digits, fallback to 4 if not in special cases
	let prefix = number.substring(0, 5);
	if (!["07025", "07026", "07027", "07028", "07029"].includes(prefix)) {
		prefix = number.substring(0, 4);
	}

	switch (prefix) {
		// Airtel
		case "0701":
		case "0708":
		case "0802":
		case "0804":
		case "0808":
		case "0812":
		case "0901":
		case "0904":
		case "0907":
		case "0911":
		case "0912":
			return "Airtel";

		// MTN
		case "0703":
		case "0704":
		case "0706":
		case "0707":
		case "0709":
		case "0803":
		case "0806":
		case "0810":
		case "0813":
		case "0814":
		case "0816":
		case "0819":
		case "0902":
		case "0903":
		case "0906":
		case "0913":
		case "0916":
			return "MTN";

		// Glo
		case "0805":
		case "0807":
		case "0811":
		case "0815":
		case "0905":
		case "0915":
			return "Glo";

		// 9mobile
		case "0809":
		case "0817":
		case "0818":
		case "0908":
		case "0909":
		case "0918":
			return "9mobile";

		// Default
		default:
			return "MTN"; // default to MTN
	}
}
