import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Screens will be created in ../screens/
import AuthChoice from './screens/AuthChoice';
import HomePage from './HomePage';
import Registration from './screens/Registration';
import Dashboard from './screens/Dashboard';
import PaymentInitiate from './screens/PaymentInitiate';
import PaymentRequest from './screens/PaymentRequest';
import TransferInstructions from './screens/TransferInstructions';
import PaymentSummary from './screens/PaymentSummary';
import SellerAcceptance from './screens/SellerAcceptance';
import PaymentTracker from './screens/PaymentTracker';
import ClaimSubmit from './screens/ClaimSubmit';
import ClaimStatus from './screens/ClaimStatus';
import AdminDashboard from './screens/AdminDashboard';
import Notifications from './screens/Notifications';
import VerifyEmail from './screens/VerifyEmail';
import ResetPassword from './screens/ResetPassword';
import Login from './screens/Login';
import Terminos from './screens/Terminos';
import Privacidad from './screens/Privacidad';
import KYCCompleted from './screens/KYCCompleted';
import EarlyAccess from './screens/EarlyAccess';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* EARLY ACCESS ONLY: Remove this block to re-enable full platform */}
      <Route path="/" element={<EarlyAccess />} />
      {/* END EARLY ACCESS BLOCK */}
      <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthChoice />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/kyc-completed" element={<KYCCompleted />} />
        <Route path="/payment/initiate" element={<PaymentInitiate />} />
        <Route path="/payment/request" element={<PaymentRequest />} />
        <Route path="/transfer-instructions" element={<TransferInstructions />} />
        <Route path="/payment/summary" element={<PaymentSummary />} />
        <Route path="/seller/acceptance" element={<SellerAcceptance />} />
        <Route path="/payment/tracker" element={<PaymentTracker />} />
        <Route path="/claim/submit" element={<ClaimSubmit />} />
        <Route path="/claim/status" element={<ClaimStatus />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/early-access" element={<EarlyAccess />} />
      </Routes>
    </Router>
  );
}
