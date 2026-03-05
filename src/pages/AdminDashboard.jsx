import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Default inventory data
const DEFAULT_INVENTORY = {
  bases: [
    { id: 'b1', name: 'Thin Crust', price: 100, stock: 50 },
    { id: 'b2', name: 'Thick Crust', price: 120, stock: 45 },
    { id: 'b3', name: 'Stuffed Crust', price: 150, stock: 30 },
    { id: 'b4', name: 'Whole Wheat', price: 110, stock: 40 }
  ],
  sauces: [
    { id: 's1', name: 'Tomato', price: 30, stock: 100 },
    { id: 's2', name: 'BBQ', price: 40, stock: 80 },
    { id: 's3', name: 'White Sauce', price: 45, stock: 60 },
    { id: 's4', name: 'Hot Sauce', price: 35, stock: 70 }
  ],
  cheeses: [
    { id: 'c1', name: 'Mozzarella', price: 50, stock: 90 },
    { id: 'c2', name: 'Cheddar', price: 45, stock: 85 },
    { id: 'c3', name: 'Processed', price: 35, stock: 100 },
    { id: 'c4', name: 'No Cheese', price: 0, stock: 100 }
  ],
  veggies: [
    { id: 'v1', name: 'Onions', price: 15, stock: 15 },
    { id: 'v2', name: 'Tomatoes', price: 15, stock: 10 },
    { id: 'v3', name: 'Bell Peppers', price: 20, stock: 25 },
    { id: 'v4', name: 'Mushrooms', price: 25, stock: 18 },
    { id: 'v5', name: 'Olives', price: 20, stock: 30 },
    { id: 'v6', name: 'Corn', price: 15, stock: 40 },
    { id: 'v7', name: 'Jalapeños', price: 15, stock: 35 },
    { id: 'v8', name: 'Pineapple', price: 20, stock: 22 }
  ],
  meats: [
    { id: 'm1', name: 'Chicken Tikka', price: 60, stock: 12 },
    { id: 'm2', name: 'Pepperoni', price: 55, stock: 8 },
    { id: 'm3', name: 'Chicken Sausage', price: 50, stock: 20 },
    { id: 'm5', name: 'Bacon', price: 65, stock: 5 }
  ]
};

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login');
      return;
    }

    // Fetch orders from localStorage
    const storedOrders = localStorage.getItem('pizzaOrders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }

    // Fetch inventory from localStorage or use default
    const storedInventory = localStorage.getItem('pizzaInventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }
  }, [user, isAdmin, navigate]);

  const updateOrderStatus = (orderId, status) => {
    try {
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status, updatedAt: new Date().toLocaleString() } : order
      );
      
      setOrders(updatedOrders);
      localStorage.setItem('pizzaOrders', JSON.stringify(updatedOrders));
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const restockItem = (category, itemName) => {
    setInventory(prev => {
      const newInventory = { ...prev };
      if (newInventory[category]) {
        newInventory[category] = newInventory[category].map(item => 
          item.name === itemName ? { ...item, stock: item.stock + 50 } : item
        );
      }
      localStorage.setItem('pizzaInventory', JSON.stringify(newInventory));
      return newInventory;
    });
    toast.success(`${itemName} restocked!`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Get all items with low stock
  const lowStockItems = Object.entries(inventory).flatMap(([category, items]) => 
    items.filter(item => item.stock < 20).map(item => ({ ...item, category }))
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Inventory Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Low Stock Alerts</h2>
            <div className="space-y-2">
              {lowStockItems.length === 0 ? (
                <p className="text-green-600">All items well stocked!</p>
              ) : (
                lowStockItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span>{item.name} ({item.stock} left)</span>
                    <button 
                      onClick={() => restockItem(item.category, item.name)} 
                      className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600"
                    >
                      Restock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Orders Stats */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Recent Orders ({orders.length})</h2>
            <div className="overflow-x-auto space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl p-6 shadow-md text-center">
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Order #{order.id.slice(-6).toUpperCase()}</h3>
                        <p className="text-gray-600">₹{order.totalAmount?.toFixed(2)}</p>
                        <p className="text-gray-500 text-sm">User: {order.userId}</p>
                        <p className="text-gray-500 text-sm">{order.createdAt || 'Recently'}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'kitchen' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'delivering' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'received'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">Order Details:</h4>
                      <p className="text-sm">Base: {order.pizza?.base || 'N/A'}</p>
                      <p className="text-sm">Sauce: {order.pizza?.sauce || 'N/A'}</p>
                      <p className="text-sm">Cheese: {order.pizza?.cheese || 'N/A'}</p>
                      <p className="text-sm">Quantity: {order.pizza?.quantity || 1}</p>
                      {(order.pizza?.veggies?.length > 0 || order.pizza?.meats?.length > 0) && (
                        <p className="text-sm">Toppings: {[
                          ...(order.pizza?.veggies || []),
                          ...(order.pizza?.meats || [])
                        ].join(', ')}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <button onClick={() => updateOrderStatus(order.id, 'kitchen')} 
                              className="bg-yellow-500 text-white px-6 py-2 rounded-xl hover:bg-yellow-600 transition-colors">
                        Kitchen
                      </button>
                      <button onClick={() => updateOrderStatus(order.id, 'delivering')} 
                              className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors">
                        Delivery
                      </button>
                      <button onClick={() => updateOrderStatus(order.id, 'delivered')} 
                              className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition-colors">
                        Delivered
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
