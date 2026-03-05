import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch orders from localStorage
    const storedOrders = localStorage.getItem('pizzaOrders');
    if (storedOrders) {
      const allOrders = JSON.parse(storedOrders);
      const userOrders = allOrders.filter(order => order.userId === user.email);
      setOrders(userOrders);
    }
    setLoading(false);
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'kitchen':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivering':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">🍕 Welcome to Pizza Palace</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">🍕 Build Your Pizza</h2>
            <p className="text-gray-600 mb-6">Create your own custom pizza with your favorite ingredients!</p>
            <Link
              to="/pizza"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              Start Building
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">📋 Your Profile</h2>
            <p className="text-gray-600 mb-2">Email: {user?.email}</p>
            <p className="text-gray-500 text-sm">Member since: Recently</p>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <Link
                to="/pizza"
                className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
              >
                Order Your First Pizza
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Order #{order.id.slice(-6).toUpperCase()}</h3>
                      <p className="text-gray-600">₹{order.totalAmount?.toFixed(2)}</p>
                      <p className="text-gray-500 text-sm">{order.createdAt || 'Recently'}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status || 'received'}
                    </span>
                  </div>
                  
                  {/* Pizza Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Pizza Details:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><span className="font-medium">Base:</span> {order.pizza?.base || 'N/A'}</div>
                      <div><span className="font-medium">Sauce:</span> {order.pizza?.sauce || 'N/A'}</div>
                      <div><span className="font-medium">Cheese:</span> {order.pizza?.cheese || 'N/A'}</div>
                      <div><span className="font-medium">Qty:</span> {order.pizza?.quantity || 1}</div>
                    </div>
                    {(order.pizza?.veggies?.length > 0 || order.pizza?.meats?.length > 0) && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Toppings:</span> {[
                          ...(order.pizza?.veggies || []),
                          ...(order.pizza?.meats || [])
                        ].join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
