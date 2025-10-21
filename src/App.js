import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import SMSLogs from "./pages/Search";
import Logs from "./pages/Logs";
import CreditWallet from "./pages/CreditWallet";
import WalletExport from "./pages/WalletExport";
import InternationalRates from "./pages/Countries";
import AuditLogs from "./pages/Audit";
import { CreateUser } from "./pages/CreateUser";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DaahboardLayout";
import DashboardPage from "./pages/DashboardPage";
import SendMultipleSmsPage from "./pages/MultipleSms";
import CreateUserPage from "./pages/CreateUsers";
import MessageSearch from "./pages/MessageSearch";
import UploadedFilesList from "./pages/UploadList";
import SummaryPage from "./pages/SummaryPage";
import ManageMessageCategories from "./pages/CreateCategories";
import UploadedFilesTable from "./pages/UploadedFilesTable";
import SummaryDashboard from "./pages/SummaryDashboard";
import UsersPage from "./pages/UsersPage";
import BulkLogs from "./pages/LogsNew";
import BulkAuditLogs from "./pages/BulkAudit";
import FileSummaryPage from "./pages/FileSummary";
import OtpSmsLgs from "./pages/OtpSearch";
import { International } from "./pages/International";
import { InternationalOTPMessages } from "./pages/InternationalOTPMessages";
import { InternationalTable } from "./pages/InternationalTable";
import BulkSmsLgs from "./pages/BulkSearch";

function App() {
	return (
		<Routes>
			<Route path='/login' element={<Login />} />
			<Route path='/otp' element={<Otp />} />
			<Route path='/reset-password' element={<ResetPassword />} />
			<Route
				path='/'
				element={
					<ProtectedRoute>
						<DashboardLayout />
					</ProtectedRoute>
				}
			>
				<Route path='portal' element={<Dashboard />} />
				<Route path='sms' element={<SMSLogs />} />
				<Route path='otpsms' element={<OtpSmsLgs />} />
				<Route path='bulksms' element={<BulkSmsLgs />} />
				<Route path='users' element={<CreateUser />} />
				<Route path='international' element={<International />} />
				<Route
					path='international-otp'
					element={<InternationalOTPMessages />}
				/>
				<Route
					path='international-country-log'
					element={<InternationalTable />}
				/>
				<Route path='logs' element={<Logs />} />
				<Route path='wallet/credit' element={<CreditWallet />} />
				<Route path='wallet-export' element={<WalletExport />} />
				<Route path='rates' element={<InternationalRates />} />
				<Route path='audit-logs' element={<AuditLogs />} />
				<Route path='bulksms/dashboard' element={<DashboardPage />} />

				<Route
					path='dashboard/send-multiple-sms'
					element={<SendMultipleSmsPage />}
				/>
				<Route path='dashboard/create_user' element={<CreateUserPage />} />

				<Route path='dashboard/search' element={<MessageSearch />} />
				<Route
					path='dashboard/uploaded_files'
					element={<UploadedFilesList />}
				/>
				<Route path='dashboard/summary' element={<SummaryPage />} />
				<Route
					path='dashboard/categories'
					element={<ManageMessageCategories />}
				/>
				<Route path='dashboard/sent' element={<UploadedFilesTable />} />
				<Route
					path='dashboard/message-summary'
					element={<SummaryDashboard />}
				/>
				<Route path='dashboard/users' element={<UsersPage />} />
				<Route path='dashboard/logs' element={<BulkLogs />} />
				<Route path='dashboard/audit-logs' element={<BulkAuditLogs />} />
				<Route
					path='dashboard/file-summary/:batch_id'
					element={<FileSummaryPage />}
				/>
			</Route>
			<Route path='*' element={<Navigate to='/portal' replace />} />
		</Routes>
	);
}

export default App;
