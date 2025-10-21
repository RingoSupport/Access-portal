import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import {
	Box,
	Typography,
	TextField,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import { FiTrash2, FiInbox } from "react-icons/fi";
import { toast } from "react-toastify";

// Import colors from the palette file
import { BRAND, STATUS_COLORS, EXTRA_COLORS } from "../theme/colors";

const UsersPage = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editForm, setEditForm] = useState({
		id: "",
		full_name: "",
		role: "",
		email: "",
	});

	const token = localStorage.getItem("zenith_token");

	const fetchUsers = async () => {
		try {
			const res = await axios.get(
				"https://accessbulk.approot.ng/allusers.php",
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (res.data.status) {
				setUsers(res.data.users);
			} else {
				toast.error(res.data.message || "Failed to load users.");
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to fetch users.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleEditClick = (user) => {
		setEditForm({
			id: user.id,
			full_name: user.full_name,
			role: user.role,
			email: user.email,
		});
		setEditDialogOpen(true);
	};

	const roles = ["technical_support", "admin", "customer_support"];

	const handleDeleteClick = (user) => {
		setSelectedUser(user);
		setConfirmDialogOpen(true);
	};

	const handleEditSubmit = async () => {
		try {
			const res = await axios.post(
				"https://accessbulk.approot.ng/edit_user.php",
				editForm,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (res.data.status) {
				toast.success("User updated successfully");
				setEditDialogOpen(false);
				fetchUsers();
			} else {
				toast.error(res.data.message || "Failed to update user.");
			}
		} catch (err) {
			console.error(err);
			toast.error("Error updating user.");
		}
	};

	const confirmDelete = async () => {
		try {
			await axios.delete("https://accessbulk.approot.ng/delete_user.php", {
				headers: { Authorization: `Bearer ${token}` },
				data: { user_id: selectedUser.id },
			});
			toast.success("User deleted successfully");
			setConfirmDialogOpen(false);
			setSelectedUser(null);
			fetchUsers(); // Refresh list
		} catch (err) {
			console.error(err);
			toast.error("Failed to delete user.");
		}
	};

	const filteredUsers = users.filter((user) =>
		user.full_name.toLowerCase().includes(search.toLowerCase())
	);

	const columns = [
		{ field: "id", headerName: "ID", width: 70 },
		{ field: "full_name", headerName: "Full Name", width: 200 },
		{ field: "email", headerName: "Email", width: 230 },
		{ field: "role", headerName: "Role", width: 180 },
		{ field: "created_at", headerName: "Created At", width: 180 },
		{
			field: "actions",
			type: "actions",
			headerName: "Actions",
			width: 100,
			getActions: (params) => [
				<GridActionsCellItem
					icon={<FiInbox style={{ color: EXTRA_COLORS.text.secondary }} />}
					label='Edit'
					onClick={() => handleEditClick(params.row)}
				/>,
				<GridActionsCellItem
					icon={<FiTrash2 style={{ color: STATUS_COLORS.errorText }} />}
					label='Delete'
					onClick={() => handleDeleteClick(params.row)}
				/>,
			],
		},
	];

	return (
		<Box
			sx={{
				height: 600,
				width: "100%",
				padding: 2,
				backgroundColor: EXTRA_COLORS.background.default,
				color: EXTRA_COLORS.text.primary,
			}}
		>
			<Typography
				variant='h5'
				gutterBottom
				sx={{ color: EXTRA_COLORS.text.primary }}
			>
				User Management
			</Typography>

			<TextField
				label='Search by Name'
				variant='outlined'
				size='small'
				fullWidth
				margin='normal'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				sx={{
					"& .MuiOutlinedInput-root": {
						"& fieldset": { borderColor: EXTRA_COLORS.border.light },
						"&:hover fieldset": { borderColor: EXTRA_COLORS.border.light },
						"&.Mui-focused fieldset": { borderColor: BRAND.activeBg },
						color: EXTRA_COLORS.text.primary,
					},
					"& .MuiInputLabel-root": { color: EXTRA_COLORS.text.secondary },
				}}
			/>

			{loading ? (
				<Box className='flex items-center justify-center mt-16'>
					<CircularProgress sx={{ color: BRAND.activeBg }} />
				</Box>
			) : filteredUsers.length === 0 ? (
				<Box
					className='text-center mt-20'
					sx={{ color: EXTRA_COLORS.text.muted }}
				>
					<FiInbox className='text-6xl mx-auto mb-2' />
					<Typography variant='subtitle1'>No users found</Typography>
				</Box>
			) : (
				<DataGrid
					rows={filteredUsers}
					columns={columns}
					getRowId={(row) => row.id}
					pageSizeOptions={[10, 20, 50]}
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10 },
						},
						sorting: {
							sortModel: [{ field: "created_at", sort: "desc" }],
						},
					}}
					slots={{ toolbar: GridToolbar }}
					slotProps={{ toolbar: { showQuickFilter: true } }}
					sx={{
						cursor: "pointer",
						border: `1px solid ${EXTRA_COLORS.border.light}`,
						backgroundColor: EXTRA_COLORS.background.paper,
						"& .MuiDataGrid-row:hover": {
							backgroundColor: EXTRA_COLORS.background.default,
						},
						"& .MuiDataGrid-columnHeaderTitle": {
							color: EXTRA_COLORS.text.primary,
						},
						"& .MuiDataGrid-cell": {
							color: EXTRA_COLORS.text.secondary,
						},
					}}
				/>
			)}

			<Dialog
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: EXTRA_COLORS.background.paper,
					},
				}}
			>
				<DialogTitle sx={{ color: EXTRA_COLORS.text.primary }}>
					Edit User
				</DialogTitle>
				<DialogContent>
					<TextField
						label='Full Name'
						value={editForm.full_name}
						onChange={(e) =>
							setEditForm((prev) => ({ ...prev, full_name: e.target.value }))
						}
						fullWidth
						margin='normal'
						sx={{
							"& .MuiOutlinedInput-root": {
								"& fieldset": { borderColor: EXTRA_COLORS.border.light },
								"&:hover fieldset": { borderColor: EXTRA_COLORS.border.light },
								"&.Mui-focused fieldset": { borderColor: BRAND.activeBg },
								color: EXTRA_COLORS.text.primary,
							},
							"& .MuiInputLabel-root": { color: EXTRA_COLORS.text.secondary },
						}}
					/>

					<TextField
						label='Email'
						value={editForm.email}
						fullWidth
						margin='normal'
						disabled
						sx={{
							"& .MuiOutlinedInput-root": {
								"& fieldset": { borderColor: EXTRA_COLORS.border.light },
								"&.Mui-disabled": {
									"& fieldset": { borderColor: EXTRA_COLORS.border.light },
								},
								color: EXTRA_COLORS.text.muted,
							},
							"& .MuiInputLabel-root": { color: EXTRA_COLORS.text.muted },
						}}
					/>

					<TextField
						label='Role'
						select
						value={editForm.role}
						onChange={(e) =>
							setEditForm((prev) => ({ ...prev, role: e.target.value }))
						}
						fullWidth
						margin='normal'
						SelectProps={{
							native: true,
						}}
						sx={{
							"& .MuiOutlinedInput-root": {
								"& fieldset": { borderColor: EXTRA_COLORS.border.light },
								"&:hover fieldset": { borderColor: EXTRA_COLORS.border.light },
								"&.Mui-focused fieldset": { borderColor: BRAND.activeBg },
								color: EXTRA_COLORS.text.primary,
							},
							"& .MuiInputLabel-root": { color: EXTRA_COLORS.text.secondary },
						}}
					>
						<option value='' disabled>
							Select Role
						</option>
						{roles.map((role) => (
							<option key={role} value={role}>
								{role.charAt(0).toUpperCase() + role.slice(1)}
							</option>
						))}
					</TextField>
				</DialogContent>

				<DialogActions
					sx={{ backgroundColor: EXTRA_COLORS.background.default }}
				>
					<Button
						onClick={() => setEditDialogOpen(false)}
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleEditSubmit}
						variant='contained'
						sx={{
							backgroundColor: EXTRA_COLORS.successText,
							"&:hover": { backgroundColor: EXTRA_COLORS.successBorder },
						}}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={confirmDialogOpen}
				onClose={() => setConfirmDialogOpen(false)}
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: EXTRA_COLORS.background.paper,
					},
				}}
			>
				<DialogTitle sx={{ color: EXTRA_COLORS.text.primary }}>
					Confirm Delete
				</DialogTitle>
				<DialogContent sx={{ color: EXTRA_COLORS.text.secondary }}>
					Are you sure you want to delete
					<strong style={{ color: BRAND.activeText, paddingLeft: "4px" }}>
						{selectedUser?.full_name}
					</strong>
					?
				</DialogContent>
				<DialogActions
					sx={{ backgroundColor: EXTRA_COLORS.background.default }}
				>
					<Button
						onClick={() => setConfirmDialogOpen(false)}
						sx={{ color: EXTRA_COLORS.text.secondary }}
					>
						Cancel
					</Button>
					<Button
						onClick={confirmDelete}
						variant='contained'
						sx={{
							backgroundColor: STATUS_COLORS.errorText,
							"&:hover": { backgroundColor: STATUS_COLORS.errorBorder },
						}}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default UsersPage;
