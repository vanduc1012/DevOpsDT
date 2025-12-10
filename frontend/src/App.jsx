import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import MenuManagement from './pages/MenuManagement';
import TableManagement from './pages/TableManagement';
import OrderManagement from './pages/OrderManagement';
import PriceManagement from './pages/PriceManagement';
import PromotionManagement from './pages/PromotionManagement';
import InventoryManagement from './pages/InventoryManagement';
import PaymentManagement from './pages/PaymentManagement';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import ReviewManagement from './pages/ReviewManagement';
import Profile from './pages/Profile';
import BookTable from './pages/BookTable';
import MyOrders from './pages/MyOrders';
import ViewMenu from './pages/ViewMenu';
import OrderOnline from './pages/OrderOnline';
import Payment from './pages/Payment';
import BlogDetail from './pages/BlogDetail';
import BlogAdmin from './pages/BlogAdmin';
import { authService } from './api/services';

function App() {
  const isAuthenticated = authService.getCurrentUser() !== null;

  return (
    <LanguageProvider>
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/menu" element={<PrivateRoute><ViewMenu /></PrivateRoute>} />
          <Route path="/book-table" element={<PrivateRoute><BookTable /></PrivateRoute>} />
          <Route path="/order-online" element={<PrivateRoute><OrderOnline /></PrivateRoute>} />
          <Route path="/payment/:orderId" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/blog/:slug" element={<PrivateRoute><BlogDetail /></PrivateRoute>} />
          
          <Route path="/admin/menu" element={<PrivateRoute adminOnly={true}><MenuManagement /></PrivateRoute>} />
          <Route path="/admin/tables" element={<PrivateRoute adminOnly={true}><TableManagement /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute adminOnly={true}><OrderManagement /></PrivateRoute>} />
          <Route path="/admin/prices" element={<PrivateRoute adminOnly={true}><PriceManagement /></PrivateRoute>} />
          <Route path="/admin/promotions" element={<PrivateRoute adminOnly={true}><PromotionManagement /></PrivateRoute>} />
          <Route path="/admin/inventory" element={<PrivateRoute adminOnly={true}><InventoryManagement /></PrivateRoute>} />
          <Route path="/admin/payment" element={<PrivateRoute adminOnly={true}><PaymentManagement /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly={true}><UserManagement /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute adminOnly={true}><Reports /></PrivateRoute>} />
          <Route path="/admin/reviews" element={<PrivateRoute adminOnly={true}><ReviewManagement /></PrivateRoute>} />
          <Route path="/admin/blogs" element={<PrivateRoute adminOnly={true}><BlogAdmin /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
    </LanguageProvider>
  );
}

export default App;
