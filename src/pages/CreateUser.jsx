import { useState, useEffect } from "react";
import axios from "axios";
import {
	Box,
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	MenuItem,
	Paper,
	Typography,
	CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";

const roles = [
	{ value: "user", label: "User" },
	{ value: "admin", label: "Admin" },
];

export const CreateUser = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);

	const token = localStorage.getItem("access_token");

	const confirmDelete = (user) => {
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	const [form, setForm] = useState({
		email: "",
		password: "",
		fullname: "",
		role: "user",
	});

	const handleOpenModal = (user = null) => {
		setEditingUser(user);
		if (user) {
			setForm({
				email: user.email,
				password: "",
				fullname: user.fullname,
				role: user.role,
			});
		} else {
			setForm({ email: "", password: "", fullname: "", role: "user" });
		}
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditingUser(null);
	};

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async () => {
		const url = editingUser
			? `"https://accessbulk.approot.ng/editUsers.php?id=${editingUser.id}`
			: `"https://accessbulk.approot.ng/createUser.php`;

		if (!form.email || (!editingUser && !form.password)) {
			toast.error("Email and password are required.");
			return;
		}

		try {
			const response = await axios.post(url, form, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.data.status === "success" || response.data.status) {
				toast.success(editingUser ? "User updated" : "User created");
				handleCloseModal();
				fetchUsers();
			} else {
				toast.error(response.data.message || "Operation failed.");
			}
		} catch {
			toast.error("Server error.");
		}
	};

	const handleConfirmDelete = async () => {
		if (!userToDelete) return;
		try {
			const res = await axios.delete(
				`https://providus.approot.ng/server/deleteUser.php?id=${userToDelete.id}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			if (res.data.status) {
				toast.success("User deleted");
				fetchUsers();
			} else {
				toast.error("Failed to delete user");
			}
		} catch {
			toast.error("Server error deleting user");
		} finally {
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		}
	};

	const columns = [
		{ field: "serial", headerName: "ID", width: 70 },
		{ field: "fullname", headerName: "Full Name", width: 180 },
		{ field: "email", headerName: "Email", width: 200 },
		{ field: "role", headerName: "Role", width: 100 },
		{
			field: "actions",
			headerName: "Actions",
			width: 180,
			renderCell: (params) => (
				<Box display='flex' gap={1}>
					<Button
						variant='outlined'
						size='small'
						sx={{
							color: "#E3000F", // 🔴 Primary
							borderColor: "#E3000F",
							"&:hover": { bgcolor: "#FDE7E8", borderColor: "#7F070F" }, // accent hover
						}}
						onClick={() => handleOpenModal(params.row)}
					>
						Edit
					</Button>
					<Button
						variant='outlined'
						size='small'
						sx={{
							color: "#7F070F", // 🟥 Dark Shade
							borderColor: "#7F070F",
							"&:hover": { bgcolor: "#F68A8E", borderColor: "#E3000F" }, // 🌸 accent
						}}
						onClick={() => confirmDelete(params.row)}
					>
						Delete
					</Button>
				</Box>
			),
		},
	];

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`https://providus.approot.ng/server/getUsers.php`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			if (res.data.status === "success") {
				const usersWithId = res.data.users.map((u, i) => ({
					...u,
					serial: i + 1,
				}));
				setUsers(usersWithId);
			} else {
				toast.error("Failed to fetch users");
			}
		} catch {
			toast.error("Server error fetching users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return (
		<Box className='p-6 text-[#636463]'>
			{" "}
			{/* ⚫ Neutral Gray text */}
			<Box className='flex justify-between items-center mb-4'>
				<Typography variant='h5' fontWeight='bold' className='text-[#E3000F]'>
					User Management
				</Typography>
				<Button
					variant='contained'
					onClick={() => handleOpenModal()}
					sx={{
						bgcolor: "#E3000F", // 🔴 Primary
						color: "#fff",
						fontWeight: "bold",
						"&:hover": { bgcolor: "#7F070F" }, // 🟥 Dark shade hover
					}}
				>
					Add User
				</Button>
			</Box>
			<Paper
				elevation={3}
				sx={{
					p: 2,
					border: "1px solid #636463", // ⚫ Neutral Gray border
					"&:hover": { borderColor: "#F68A8E" }, // 🌸 Accent hover
				}}
			>
				{loading ? (
					<Box display='flex' justifyContent='center' p={4}>
						<CircularProgress sx={{ color: "#7F070F" }} /> {/* 🟥 Dark Shade */}
					</Box>
				) : (
					<DataGrid
						rows={users}
						columns={columns}
						getRowId={(row) => row.serial}
						pageSize={10}
						rowsPerPageOptions={[10]}
						sx={{
							"& .MuiDataGrid-columnHeaders": {
								backgroundColor: "#F68A8E", // 🌸 Accent header
								color: "#7F070F", // 🟥 Dark text
							},
							"& .MuiDataGrid-row:hover": {
								backgroundColor: "#FDE7E8", // soft accent
							},
						}}
					/>
				)}
			</Paper>
			{/* Create/Edit Dialog */}
			<Dialog
				open={modalOpen}
				onClose={handleCloseModal}
				fullWidth
				maxWidth='sm'
			>
				<DialogTitle className='text-[#E3000F] font-bold'>
					{editingUser ? "Edit User" : "Create New User"}
				</DialogTitle>
				<DialogContent className='space-y-4 p-6'>
					<TextField
						fullWidth
						label='Email'
						name='email'
						value={form.email}
						onChange={handleChange}
					/>
					<TextField
						fullWidth
						label='Password'
						name='password'
						type='password'
						value={form.password}
						onChange={handleChange}
						placeholder={editingUser ? "Leave blank to keep existing" : ""}
					/>
					<TextField
						fullWidth
						label='Full Name'
						name='fullname'
						value={form.fullname}
						onChange={handleChange}
					/>
					<TextField
						select
						fullWidth
						label='Role'
						name='role'
						value={form.role}
						onChange={handleChange}
					>
						{roles.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseModal}>Cancel</Button>
					<Button
						variant='contained'
						sx={{
							bgcolor: "#E3000F", // 🔴 Primary
							color: "#fff",
							fontWeight: "bold",
							"&:hover": { bgcolor: "#7F070F" }, // 🟥 Dark Shade hover
						}}
						onClick={handleSubmit}
					>
						{editingUser ? "Update" : "Create"}
					</Button>
				</DialogActions>
			</Dialog>
			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle className='text-[#E3000F] font-bold'>
					Confirm Deletion
				</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete{" "}
						<strong>{userToDelete?.fullname || "this user"}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button
						variant='contained'
						sx={{
							bgcolor: "#7F070F", // 🟥 Dark Shade
							color: "#fff",
							"&:hover": { bgcolor: "#E3000F" }, // 🔴 Primary hover
						}}
						onClick={handleConfirmDelete}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
