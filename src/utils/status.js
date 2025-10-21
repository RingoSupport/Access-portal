// utils/statusHelpers.js
import React from "react";
import { Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

export const getStatusChip = (status) => {
	switch (status) {
		case "DELIVRD":
			return (
				<Chip
					label='Delivered'
					color='success'
					icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
					sx={{ fontWeight: "medium" }}
				/>
			);

		case "EXPIRD":
			return (
				<Chip
					label='Expired'
					color='default'
					icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
					sx={{ fontWeight: "medium" }}
				/>
			);

		case "UNDELIV":
			return (
				<Chip
					label='Undelivered'
					color='error'
					icon={<ErrorIcon sx={{ fontSize: 16 }} />}
					sx={{ fontWeight: "medium" }}
				/>
			);

		case "REJECTD":
			return (
				<Chip
					label='Rejected'
					color='error'
					icon={<ErrorIcon sx={{ fontSize: 16 }} />}
					sx={{ fontWeight: "medium" }}
				/>
			);

		case null:
		case "0":
			return (
				<Chip
					label='Pending'
					color='warning'
					icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
					sx={{ fontWeight: "medium" }}
				/>
			);

		default:
			return (
				<Chip
					label='Sent'
					color='info'
					icon={<VisibilityIcon sx={{ fontSize: 16 }} />}
					sx={{ fontWeight: "medium" }}
				/>
			);
	}
};
