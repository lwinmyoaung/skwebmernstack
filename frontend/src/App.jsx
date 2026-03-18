import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductManager from './pages/AdminProductManager';
import AdminPaymentManager from './pages/AdminPaymentManager';
import AdminOrderManager from './pages/AdminOrderManager';
import AdminSlideshowManager from './pages/AdminSlideshowManager';
import AdminGameImageManager from './pages/AdminGameImageManager';
import AdminUserManager from './pages/AdminUserManager';
import AdminProfitTracker from './pages/AdminProfitTracker';
import AdminContactManager from './pages/AdminContactManager';
import AdminLogoManager from './pages/AdminLogoManager';
import MyOrders from './pages/MyOrders';
import Inbox from './pages/Inbox';
import CookieAndApiManager from './pages/CookieAndApiManager';
import GameDetail from './pages/GameDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import HowToUse from './pages/HowToUse';
import AdminHowToUse from './pages/AdminHowToUse';
import AdminGameManager from './pages/AdminGameManager';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/games" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/game/:gameId" element={<GameDetail />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-orders" 
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox" 
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/how-to-use" 
              element={
                <AdminRoute>
                  <AdminHowToUse />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/games" 
              element={
                <AdminRoute>
                  <AdminGameManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <AdminRoute>
                  <AdminOrderManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <CookieAndApiManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/products/:gameId" 
              element={
                <AdminRoute>
                  <AdminProductManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/payments" 
              element={
                <AdminRoute>
                  <AdminPaymentManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/slideshow" 
              element={
                <AdminRoute>
                  <AdminSlideshowManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/game-images" 
              element={
                <AdminRoute>
                  <AdminGameImageManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUserManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/profit" 
              element={
                <AdminRoute>
                  <AdminProfitTracker />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/contacts" 
              element={
                <AdminRoute>
                  <AdminContactManager />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/logos" 
              element={
                <AdminRoute>
                  <AdminLogoManager />
                </AdminRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </SocketProvider>
  </AuthProvider>
);
}

export default App;
