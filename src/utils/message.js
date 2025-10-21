export function msgCount(msg) {
	msg = msg.trim();

	// Count the string length in UTF-8
	let strLn = [...msg].length;

	// Count special GSM characters (^, {, }, \, ~, €, |, [, ])
	const regex = /[\^{}~€|[\]\\]/g; // Removed 'u' flag for broader compatibility
	const specialCount = (msg.match(regex) || []).length;

	// Add special character count to total length
	strLn += specialCount;

	// Determine number of SMS segments based on GSM encoding
	let len = 0;
	if (strLn <= 160) {
		len = 1;
	} else if (strLn <= 306) {
		len = 2;
	} else if (strLn <= 459) {
		len = 3;
	} else if (strLn <= 612) {
		len = 4;
	} else if (strLn <= 765) {
		len = 5;
	} else if (strLn <= 918) {
		len = 6;
	} else if (strLn <= 1071) {
		len = 7;
	} else if (strLn <= 1224) {
		len = 8;
	}

	return [len, strLn];
}
