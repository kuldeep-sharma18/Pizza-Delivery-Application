import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../App';
import toast from 'react-hot-toast';

// Safe Image Component with fallback
const SafeImage = ({ src, alt, className, fallback = '🍕' }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={`${className} bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-2xl`} title={alt}>
        {fallback}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

// Product images 
const PRODUCT_IMAGES = {
  bases: {
    'Thin Crust': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
    'Thick Crust': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80',
    'Stuffed Crust': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80',
    'Whole Wheat': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80'
  },
  sauces: {
    'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&q=80',
    'BBQ': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80',
    'White Sauce': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=200&q=80',
    'Hot Sauce': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqAc-shXdZGUYs5rYzwK-OYquZ7Y_IcdJNGg&s'
  },
  cheeses: {
    'Mozzarella': 'https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=200&q=80',
    'Cheddar': 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200&q=80',
    'Processed': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxjwt8DbsRmt60nZVoSbBiVAsupflb4xHDJw&s',
    'No Cheese': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=200&q=80'
  },
  veggies: {
    'Onions': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=150&q=80',
    'Tomatoes': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&q=80',
    'Bell Peppers': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReg6SVAYDcHepnI-6hEQIju-E-QPFEAKVc6A&s',
    'Mushrooms': 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=150&q=80',
    'Olives': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgCjP_CsjbolOlOaIKNIAscO6KyhIcwzXyMQ&s',
    'Corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=150&q=80',
    'Jalapeños': 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=150&q=80',
    'Pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=150&q=80'
  },
  meats: {
    'Chicken Tikka': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=150&q=80',
    'Pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=150&q=80',
    'Chicken Sausage': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLeq5qJK-2dNQjUGHV-sBPYxrb-hBgiZKE6Q&s',
    'Bacon': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=150&q=80'
  }
};

// Default inventory data
const DEFAULT_INVENTORY = {
  bases: [
    { id: 'b1', name: 'Thin Crust', price: 100 },
    { id: 'b2', name: 'Thick Crust', price: 120 },
    { id: 'b3', name: 'Stuffed Crust', price: 150 },
    { id: 'b4', name: 'Whole Wheat', price: 110 }
  ],
  sauces: [
    { id: 's1', name: 'Tomato', price: 30 },
    { id: 's2', name: 'BBQ', price: 40 },
    { id: 's3', name: 'White Sauce', price: 45 },
    { id: 's4', name: 'Hot Sauce', price: 35 }
  ],
  cheeses: [
    { id: 'c1', name: 'Mozzarella', price: 50 },
    { id: 'c2', name: 'Cheddar', price: 45 },
    { id: 'c3', name: 'Processed', price: 35 },
    { id: 'c4', name: 'No Cheese', price: 0 }
  ],
  veggies: [
    { id: 'v1', name: 'Onions', price: 15, category: 'veg' },
    { id: 'v2', name: 'Tomatoes', price: 15, category: 'veg' },
    { id: 'v3', name: 'Bell Peppers', price: 20, category: 'veg' },
    { id: 'v4', name: 'Mushrooms', price: 25, category: 'veg' },
    { id: 'v5', name: 'Olives', price: 20, category: 'veg' },
    { id: 'v6', name: 'Corn', price: 15, category: 'veg' },
    { id: 'v7', name: 'Jalapeños', price: 15, category: 'veg' },
    { id: 'v8', name: 'Pineapple', price: 20, category: 'veg' }
  ],
  meats: [
    { id: 'm1', name: 'Chicken Tikka', price: 60, category: 'meat' },
    { id: 'm2', name: 'Pepperoni', price: 55, category: 'meat' },
    { id: 'm3', name: 'Chicken Sausage', price: 50, category: 'meat' },
    { id: 'm5', name: 'Bacon', price: 65, category: 'meat' }
  ]
};

const PizzaBuilder = () => {
  useAuth();
  const { addToCart } = useCart();
  const [pizza, setPizza] = useState({
    base: '', sauce: '', cheese: '', veggies: [], meats: [], quantity: 1
  });
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setInventory(DEFAULT_INVENTORY);
  };

  const calculatePrice = () => {
    if (!inventory) return 0;
    let price = 0;

    const base = inventory.bases.find(b => b.name === pizza.base);
    if (base) price += base.price;

    const sauce = inventory.sauces.find(s => s.name === pizza.sauce);
    if (sauce) price += sauce.price;

    const cheese = inventory.cheeses.find(c => c.name === pizza.cheese);
    if (cheese) price += cheese.price;

    pizza.veggies.forEach(veggieName => {
      const veggie = inventory.veggies.find(v => v.name === veggieName);
      if (veggie) price += veggie.price;
    });

    pizza.meats.forEach(meatName => {
      const meat = inventory.meats.find(m => m.name === meatName);
      if (meat) price += meat.price;
    });

    return price * pizza.quantity;
  };

  const handleAddToCart = () => {
    if (!pizza.base) {
      toast.error('Please select a base');
      return;
    }

    const price = calculatePrice();
    const pizzaName = `Custom ${pizza.base} Pizza`;

    addToCart({
      name: pizzaName,
      price: price / pizza.quantity,
      quantity: pizza.quantity,
      image: PRODUCT_IMAGES.bases[pizza.base],
      pizza: { ...pizza }
    });

    setPizza({ base: '', sauce: '', cheese: '', veggies: [], meats: [], quantity: 1 });
  };

  if (!inventory) return <div>Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-center">🍕 Build Your Pizza</h1>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="p-6 bg-white shadow-lg rounded-2xl">
              <ConfigSection 
                title="Choose Your Base" 
                options={inventory.bases} 
                selected={pizza.base} 
                onSelect={(name) => setPizza({...pizza, base: name})}
                images={PRODUCT_IMAGES.bases}
              />
            </div>

            <div className="p-6 bg-white shadow-lg rounded-2xl">
              <ConfigSection 
                title="Select Sauce" 
                options={inventory.sauces} 
                selected={pizza.sauce} 
                onSelect={(name) => setPizza({...pizza, sauce: name})}
                images={PRODUCT_IMAGES.sauces}
              />
            </div>

            <div className="p-6 bg-white shadow-lg rounded-2xl">
              <ConfigSection 
                title="Choose Cheese" 
                options={inventory.cheeses} 
                selected={pizza.cheese} 
                onSelect={(name) => setPizza({...pizza, cheese: name})}
                images={PRODUCT_IMAGES.cheeses}
              />
            </div>

            <div className="p-6 bg-white shadow-lg rounded-2xl">
              <ToppingsSection 
                veggies={inventory.veggies} 
                meats={inventory.meats} 
                pizza={pizza} 
                setPizza={setPizza}
                images={PRODUCT_IMAGES}
              />
            </div>
          </div>

          <div className="sticky p-6 bg-white shadow-lg rounded-2xl h-fit top-4">
            <h2 className="mb-6 text-2xl font-bold">Order Summary</h2>
            
            <div className="p-4 mb-6 bg-gray-50 rounded-xl">
              <h3 className="mb-3 font-semibold">Your Pizza Preview</h3>
              <div className="space-y-2 text-sm">
                {pizza.base && (
                  <div className="flex items-center gap-2">
                    <SafeImage src={PRODUCT_IMAGES.bases[pizza.base]} alt={pizza.base} className="object-cover w-8 h-8 rounded" fallback="🫓" />
                    <span>Base: {pizza.base}</span>
                  </div>
                )}
                {pizza.sauce && (
                  <div className="flex items-center gap-2">
                    <SafeImage src={PRODUCT_IMAGES.sauces[pizza.sauce]} alt={pizza.sauce} className="object-cover w-8 h-8 rounded" fallback="🥫" />
                    <span>Sauce: {pizza.sauce}</span>
                  </div>
                )}
                {pizza.cheese && (
                  <div className="flex items-center gap-2">
                    <SafeImage src={PRODUCT_IMAGES.cheeses[pizza.cheese]} alt={pizza.cheese} className="object-cover w-8 h-8 rounded" fallback="🧀" />
                    <span>Cheese: {pizza.cheese}</span>
                  </div>
                )}
                {pizza.veggies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pizza.veggies.map(veggie => (
                      <span key={veggie} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                        <SafeImage src={PRODUCT_IMAGES.veggies[veggie]} alt={veggie} className="object-cover w-4 h-4 rounded" fallback="🥬" />
                        {veggie}
                      </span>
                    ))}
                  </div>
                )}
                {pizza.meats.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pizza.meats.map(meat => (
                      <span key={meat} className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-800 bg-red-100 rounded-full">
                        <SafeImage src={PRODUCT_IMAGES.meats[meat]} alt={meat} className="object-cover w-4 h-4 rounded" fallback="🥩" />
                        {meat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                max="10"
                value={pizza.quantity}
                onChange={(e) => setPizza({...pizza, quantity: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-8 text-3xl font-bold text-green-600">
              ₹{calculatePrice().toFixed(2)}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!pizza.base}
              className="flex items-center justify-center w-full gap-2 px-8 py-4 text-lg font-bold text-white transition-all duration-200 transform shadow-xl bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl hover:from-orange-600 hover:to-red-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🛒</span>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfigSection = ({ title, options, selected, onSelect, images }) => (
  <div>
    <h3 className="mb-4 text-xl font-semibold">{title}</h3>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {options.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.name)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg flex flex-col items-center ${
            selected === item.name
              ? 'bg-orange-500 text-white border-orange-500 shadow-orange-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <SafeImage 
            src={images[item.name]} 
            alt={item.name}
            className="object-cover w-20 h-20 mb-2 rounded-lg"
            fallback={item.name.charAt(0)}
          />
          <span className="text-sm font-medium text-center">{item.name}</span>
          <span className="text-sm font-bold">₹{item.price}</span>
        </button>
      ))}
    </div>
  </div>
);

const ToppingsSection = ({ veggies, meats, pizza, setPizza, images }) => (
  <div>
    <h3 className="mb-4 text-xl font-semibold">Toppings</h3>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[...veggies, ...meats].map((item) => (
        <label key={item.id} className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
          pizza.veggies.includes(item.name) || pizza.meats.includes(item.name)
            ? 'bg-orange-100 border-2 border-orange-500'
            : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
        }`}>
          <input
            type="checkbox"
            checked={pizza.veggies.includes(item.name) || pizza.meats.includes(item.name)}
            onChange={(e) => {
              const list = item.category === 'meat' ? 'meats' : 'veggies';
              if (e.target.checked) {
                setPizza({ ...pizza, [list]: [...pizza[list], item.name] });
              } else {
                setPizza({ ...pizza, [list]: pizza[list].filter(t => t !== item.name) });
              }
            }}
            className="hidden"
          />
          <SafeImage 
            src={images[item.category === 'meat' ? 'meats' : 'veggies'][item.name]} 
            alt={item.name}
            className="object-cover w-16 h-16 mb-2 rounded-lg"
            fallback={item.name.charAt(0)}
          />
          <span className="text-sm font-medium text-center">{item.name}</span>
          <span className="text-xs text-gray-600">₹{item.price}</span>
        </label>
      ))}
    </div>
  </div>
);

export default PizzaBuilder;
