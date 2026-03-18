const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const Product = require('./models/Product');
const User = require('./models/User');
const Game = require('./models/Game');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Games data
const games = [
  { gameId: 'mlbb', name: 'Mobile Legends', defaultImage: '/adminimages/photo/1BcdDv9B90JnlajqQvQaO3PBabTVre9U7A87diA1.jpg', badge: 'MOST POPULAR', color: 'from-blue-600/20 to-primary/20', order: 1 },
  { gameId: 'mcgg', name: 'Magic Chess GoGo', defaultImage: '/adminimages/photo/dmGEycfKf49L9fK6E64aG4CTBDCv9CnPw7eWA5V1.png', badge: 'NEW', color: 'from-purple-600/20 to-primary/20', order: 2 },
  { gameId: 'pubg', name: 'PUBG Mobile', defaultImage: '/adminimages/photo/mjOPd1akM06euiAdpG1vhTnwREEX8UbAJrez2Phv.jpg', badge: 'HOT', color: 'from-orange-600/20 to-primary/20', order: 3 },
  { gameId: 'wwm', name: 'WWM', defaultImage: '/adminimages/photo/z7SRsbBx9OlAo35d30jtryRHuvPkaAxCeWFeD1vf.jpg', badge: 'TRENDING', color: 'from-red-600/20 to-primary/20', order: 4 },
];

// Admin User data
const users = [
  {
    name: 'Admin Lwin',
    email: 'lwin@gmail.com',
    password: 'lwin', // Will be hashed by the User model's pre-save middleware
    role: 'admin',
    phone: '09123456789'
  }
];

// Products data
const products = [
  // Mobile Legends
  { game: 'mlbb', product_id: 'ml_86', name: '86 Diamonds', price: 2500, diamonds: 86, region: 'myanmar', status: 'active' },
  { game: 'mlbb', product_id: 'ml_172', name: '172 Diamonds', price: 5000, diamonds: 172, region: 'myanmar', status: 'active' },
  { game: 'mlbb', product_id: 'ml_257', name: '257 Diamonds', price: 7500, diamonds: 257, region: 'myanmar', status: 'active' },
  { game: 'mlbb', product_id: 'ml_706', name: '706 Diamonds', price: 20000, diamonds: 706, region: 'myanmar', status: 'active' },
  
  // Malaysia Region
  { game: 'mlbb', product_id: 'ml_my_86', name: '86 Diamonds (MY)', price: 3000, diamonds: 86, region: 'malaysia', status: 'active' },
  
  // PUBG
  { game: 'pubg', product_id: 'pubg_60', name: '60 UC', price: 1500, diamonds: 60, region: 'myanmar', status: 'active' },
  { game: 'pubg', product_id: 'pubg_325', name: '325 UC', price: 7000, diamonds: 325, region: 'myanmar', status: 'active' },
  
  // MCGG
  { game: 'mcgg', product_id: 'mcgg_100', name: '100 Gems', price: 1000, diamonds: 100, region: 'myanmar', status: 'active' },
  
  // WWM
  { game: 'wwm', product_id: 'wwm_500', name: '500 Coins', price: 2000, diamonds: 500, region: 'myanmar', status: 'active' },
];

// Import into DB
const importData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await Game.deleteMany();
    
    await Product.create(products);
    await User.create(users);
    await Game.create(games);
    
    console.log('Data (Products, Admin, Games) Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await Game.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
