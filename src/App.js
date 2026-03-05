import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PizzaBuilder from './components/PizzaBuilder';
import ProtectedRoute from './components/ProtectedRoute';
import toast from 'react-hot-toast';

// Cart Context
const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Cart Provider
const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('pizzaCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pizzaCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => [...prev, { ...item, cartId: Date.now().toString() }]);
    toast.success('Added to cart! 🛒');
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    toast.success('Removed from cart');
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getCartCount = () => cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Images - using reliable direct links
const PIZZA_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  margherita: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
  pepperoni: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
  veggie: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
  bbq: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
  chef: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80',
  delivery: 'https://images.unsplash.com/photo-1526367790999-015075668a5a?w=400&q=80',
  cart: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
  payment: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80'
};

// --- COMPONENTS ---

const CartView = ({ setActiveTab }) => {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI Payment', icon: '📱' },
    { id: 'wallet', name: 'Digital Wallet', icon: '👛' }
  ];

  const processPayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const orders = cartItems.map(item => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: user?.email,
      pizza: item.pizza || { name: item.name, quantity: item.quantity },
      totalAmount: item.price * item.quantity,
      status: 'confirmed',
      paymentMethod,
      paymentStatus: 'paid',
      createdAt: new Date().toLocaleString()
    }));

    const existing = JSON.parse(localStorage.getItem('pizzaOrders') || '[]');
    localStorage.setItem('pizzaOrders', JSON.stringify([...existing, ...orders]));
    
    clearCart();
    toast.success('Order placed! 🎉');
    setProcessing(false);
    setShowPayment(false);
    setActiveTab('orders');
  };

  if (showPayment) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setShowPayment(false)} className="mb-4 text-gray-600 hover:text-orange-600">← Back</button>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <img src={PIZZA_IMAGES.payment} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            <div>
              <h2 className="text-2xl font-bold">Payment Method</h2>
              <p className="text-gray-500">Choose how to pay</p>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {paymentMethods.map(m => (
              <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${paymentMethod === m.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5" />
                <span className="text-3xl">{m.icon}</span>
                <span className="font-semibold">{m.name}</span>
              </label>
            ))}
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-orange-600">₹{getCartTotal().toFixed(2)}</span>
            </div>
          </div>
          <button onClick={processPayment} disabled={processing} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50">
            {processing ? 'Processing...' : `Pay ₹${getCartTotal().toFixed(2)}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <img src={PIZZA_IMAGES.cart} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
        <div>
          <h2 className="text-3xl font-bold">Shopping Cart</h2>
          <p className="text-gray-500">{cartItems.length} items</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-600 mb-4 text-lg">Your cart is empty</p>
          <button onClick={() => setActiveTab('menu')} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold">Browse Menu 🍕</button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.cartId} className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
                <img src={item.image || PIZZA_IMAGES.margherita} alt="" className="w-24 h-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6 text-2xl font-bold">
              <span>Total</span>
              <span className="text-orange-600">₹{getCartTotal().toFixed(2)}</span>
            </div>
            <button onClick={() => setShowPayment(true)} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg">Proceed to Checkout →</button>
          </div>
        </>
      )}
    </div>
  );
};

const MenuView = () => {
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});

  const menuItems = [
    { id: 'm1', name: 'Margherita Classic', price: 299, image: PIZZA_IMAGES.margherita, description: 'Fresh mozzarella, tomato sauce, and basil' },
    { id: 'm2', name: 'Pepperoni Feast', price: 399, image: PIZZA_IMAGES.pepperoni, description: 'Double pepperoni with mozzarella' },
    { id: 'm3', name: 'Garden Fresh', price: 349, image: PIZZA_IMAGES.veggie, description: 'Bell peppers, onions, tomatoes, mushrooms' },
    { id: 'm4', name: 'BBQ Chicken', price: 429, image: PIZZA_IMAGES.bbq, description: 'Grilled chicken with BBQ sauce' }
  ];

  const handleAdd = (item) => {
    const qty = quantities[item.id] || 1;
    addToCart({ ...item, quantity: qty, pizza: { name: item.name, quantity: qty } });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <img src={PIZZA_IMAGES.hero} alt="" className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
          <div className="p-8 text-white">
            <h2 className="text-4xl font-bold mb-2">Our Menu</h2>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
            <img src={item.image} alt="" className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setQuantities(p => ({...p, [item.id]: Math.max(1, (p[item.id]||1)-1)}))} className="w-8 h-8 bg-gray-100 rounded">-</button>
                <span className="w-8 text-center">{quantities[item.id] || 1}</span>
                <button onClick={() => setQuantities(p => ({...p, [item.id]: (p[item.id]||1)+1}))} className="w-8 h-8 bg-gray-100 rounded">+</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-orange-600">₹{item.price}</span>
                <button onClick={() => handleAdd(item)} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium">🛒 Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserOrdersView = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('pizzaOrders');
    if (stored) {
      const all = JSON.parse(stored);
      setOrders(all.filter(o => o.userId === user?.email).reverse());
    }
  }, [user]);

  const getStatusColor = (s) => ({
    confirmed: 'bg-green-100 text-green-800',
    kitchen: 'bg-yellow-100 text-yellow-800',
    delivering: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800'
  }[s] || 'bg-gray-100 text-gray-800');

  const getPaymentIcon = (m) => ({ cod: '💵', card: '💳', upi: '📱', wallet: '👛' }[m] || '💰');

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">Order #{order.id.slice(-6).toUpperCase()}</h3>
                  <p className="text-gray-500 text-sm">{order.createdAt}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{getPaymentIcon(order.paymentMethod)} {order.paymentMethod?.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-gray-500">Total</p>
                <p className="text-2xl font-bold text-orange-600">₹{order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminInventoryView = () => {
  const [inventory] = useState({
    bases: [
      { name: 'Thin Crust', stock: 50, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop' },
      { name: 'Thick Crust', stock: 45, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop' }
    ],
    sauces: [
      { name: 'Tomato', stock: 100, image: 'https://images.unsplash.com/photo-1592417817098-8fd4d9d14b0d?w=100&h=100&fit=crop' },
      { name: 'BBQ', stock: 80, image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=100&h=100&fit=crop' }
    ]
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Inventory</h2>
      {Object.entries(inventory).map(([cat, items]) => (
        <div key={cat} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 capitalize">{cat}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-gray-200">
                <img src={item.image} alt="" className="w-full h-20 object-cover rounded-lg mb-3" />
                <p className="font-semibold">{item.name}</p>
                <p className={`text-sm font-bold ${item.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>{item.stock} in stock</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminAnalyticsView = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const stored = localStorage.getItem('pizzaOrders');
    if (stored) setOrders(JSON.parse(stored));
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Analytics</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-xl">
          <p className="text-sm text-orange-100">Total Revenue</p>
          <p className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <p className="text-sm text-blue-100">Total Orders</p>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <p className="text-sm text-green-100">Avg Order Value</p>
          <p className="text-3xl font-bold">₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}</p>
        </div>
      </div>
    </div>
  );
};

const ProfileView = () => {
  const { user, isAdmin } = useAuth();
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">My Profile</h2>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-6 mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl">
          <img src={PIZZA_IMAGES.chef} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white" />
          <div>
            <h3 className="text-2xl font-bold">{user?.email}</h3>
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mt-2 ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
              {isAdmin ? 'Administrator' : 'Customer'}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold text-lg">{user?.email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Account Type</p>
            <p className="font-semibold text-lg">{isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---

const UnifiedLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'orders' : 'build');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const navItems = isAdmin ? [
    { id: 'orders', label: 'Orders', icon: '📋', color: 'bg-blue-500' },
    { id: 'inventory', label: 'Inventory', icon: '📦', color: 'bg-green-500' },
    { id: 'analytics', label: 'Analytics', icon: '📊', color: 'bg-purple-500' },
    { id: 'profile', label: 'Profile', icon: '👤', color: 'bg-orange-500' }
  ] : [
    { id: 'build', label: 'Build Pizza', icon: '🍕', color: 'bg-orange-500' },
    { id: 'menu', label: 'Our Menu', icon: '📖', color: 'bg-red-500' },
    { id: 'cart', label: 'Cart', icon: '🛒', color: 'bg-green-500', badge: getCartCount() },
    { id: 'orders', label: 'My Orders', icon: '📋', color: 'bg-blue-500' },
    { id: 'profile', label: 'Profile', icon: '👤', color: 'bg-purple-500' }
  ];

  const renderContent = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'orders': return <AdminDashboard />;
        case 'inventory': return <AdminInventoryView />;
        case 'analytics': return <AdminAnalyticsView />;
        case 'profile': return <ProfileView />;
        default: return <AdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'build': return <PizzaBuilder />;
        case 'menu': return <MenuView />;
        case 'cart': return <CartView setActiveTab={setActiveTab} />;
        case 'orders': return <UserOrdersView />;
        case 'profile': return <ProfileView />;
        default: return <PizzaBuilder />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex">
      <aside className="w-72 bg-white shadow-2xl flex flex-col border-r border-orange-100">
        <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center gap-3">
            <img src={PIZZA_IMAGES.chef} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover" />
            <div>
              <h1 className="text-xl font-bold">Pizza Palace</h1>
              <p className="text-xs text-orange-100">{isAdmin ? 'Admin' : 'Order & Enjoy'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-left ${activeTab === item.id ? `${item.color} text-white shadow-lg` : 'text-gray-600 hover:bg-orange-50'}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
              {item.badge > 0 && <span className="ml-auto bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full">{item.badge}</span>}
              {activeTab === item.id && !item.badge && <span className="ml-auto">→</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-orange-100 bg-gray-50">
          <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'Customer'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-medium">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {renderContent()}
      </main>
    </div>
  );
};

// --- APP ---

function AppContent() {
  const { loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <UnifiedLayout />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
