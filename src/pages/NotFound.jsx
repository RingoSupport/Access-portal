// src/pages/NotFoundPage.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "80vh",
				textAlign: "center",
			}}
		>
			<Typography variant='h1' sx={{ fontSize: "6rem", color: "#777" }}>
				404
			</Typography>
			<Typography variant='h5' sx={{ mt: 2, mb: 4 }}>
				Oops! Page not found.
			</Typography>
			<Typography variant='body1' sx={{ mb: 4 }}>
				The page you are looking for might have been removed, had its name
				changed, or is temporarily unavailable.
			</Typography>
			<Button variant='contained' onClick={() => navigate("/portal")}>
				Go to Dashboard
			</Button>
		</Box>
	);
};

export default NotFoundPage;
