const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// CORS Middleware for Vercel
app.use(cors({
  origin: 'https://studentmart.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// API Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const app = express();

// Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
// });



app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/", {
    dbName: 'studentmartDB' // Specify the database name here
  }).then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB connection fails
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Base route
app.get('/', (req, res) => {
    res.send("🎓 Student Mart Backend is Live!");
});




// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/", {
    dbName: 'studentmartDB' // Specify the database name here
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB connection fails
  });
  

// // Routes
// const authRoutes = require('./routes/auth');
// const productRoutes = require('./routes/products');
// const cartRoutes = require('./routes/cart');

// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);

// // Static files
// app.use('/uploads', express.static('uploads'));

// // Basic Route
// app.get('/', (req, res) => {
//   res.send("Student Mart Backend");
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json()); // Parse JSON requests

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch(err => console.error("MongoDB connection error:", err));

// // Routes
// const authRoutes = require('./routes/auth');
// const productRoutes = require('./routes/products');
// const cartRoutes = require('./routes/cart');

// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);

// // Static files
// app.use('/uploads', express.static('uploads'));

// // Basic Route
// app.get('/', (req, res) => {
//   res.send("Student Mart Backend");
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


// // Add these lines before app.listen()
// const authRoutes = require('./routes/auth');
// const productRoutes = require('./routes/products');
// const cartRoutes = require('./routes/cart');

// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);

// app.use('/uploads', express.static('uploads'));


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json()); // Parse JSON requests

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch(err => console.error("MongoDB connection error:", err));

// // Basic Route
// app.get('/', (req, res) => {
//   res.send("Student Mart Backend");
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
