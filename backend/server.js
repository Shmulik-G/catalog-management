const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Product = require('./models/Product');

// Seed Data
const seedProducts = [
  {
    product_id: 1,
    product_name: "מחשב נייד",
    product_description: "מחשב נייד חדש עם מעבד i7",
    status: true,
    current_stock_level: 15,
    creation_date: new Date()
  },
  {
    product_id: 2,
    product_name: "טלפון חכם",
    product_description: "טלפון חכם עם מצלמה 48 מגה פיקסל",
    status: true,
    current_stock_level: 25,
    creation_date: new Date()
  },
  {
    product_id: 3,
    product_name: "אוזניות",
    product_description: "אוזניות אלחוטיות עם ביטול רעשים",
    status: true,
    current_stock_level: 30,
    creation_date: new Date()
  },
  {
    product_id: 4,
    product_name: "שעון חכם",
    product_description: "שעון חכם עם מעקב אחר פעילות גופנית",
    status: true,
    current_stock_level: 20,
    creation_date: new Date()
  },
  {
    product_id: 5,
    product_name: "מחשב נייד",
    product_description: "מחשב נייד חדש עם מעבד i5",
    status: true,
    current_stock_level: 20,
    creation_date: new Date()
  },
  {
    product_id: 6,
    product_name: "טלפון חכם",
    product_description: "טלפון חכם צלמה 48 מגה פיקסל",
    status: true,
    current_stock_level: 25,
    creation_date: new Date()
  },
  {
    product_id: 7,
    product_name: "אוזניות",
    product_description: "אוזניות אלחוטיות עם ביטול רעשים",
    status: true,
    current_stock_level: 30,
    creation_date: new Date()
  },
  {
    product_id: 8,
    product_name: "שעון חכם",
    product_description: "שעון חכם עם מעקב אחר פעילות גופנית",
    status: true,
    current_stock_level: 20,
    creation_date: new Date()
  },
  {
    product_id: 9,
    product_name: "מחשב נייד",
    product_description: "מחשב נייד חדש עם מעבד i7",
    status: true,
    current_stock_level: 15,
    creation_date: new Date()
  },
  {
    product_id: 10,
    product_name: "טלפון חכם",
    product_description: "טלפון חכם עם מצלמה 48 מגה פיקסל",
    status: true,
    current_stock_level: 25,
    creation_date: new Date()
  },
  {
    product_id: 11,
    product_name: "אוזניות",
    product_description: "אוזניות אלחוטיות עם ביטול רעשים",
    status: true,
    current_stock_level: 30,
    creation_date: new Date()
  },
  {
    product_id: 12,
    product_name: "שעון חכם",
    product_description: "שעון חכם עם מעקב אחר פעילות גופנית",
    status: true,
    current_stock_level: 20,
    creation_date: new Date()
  },
  {
    product_id: 13,
    product_name: "מחשב נייד",
    product_description: "מחשב נייד חדש עם מעבד i7",
    status: true,
    current_stock_level: 15,
    creation_date: new Date()
  },
  {
    product_id: 14,
    product_name: "טלפון חכם",
    product_description: "טלפון חכם עם מצלמה 48 מגה פיקסל",
    status: true,
    current_stock_level: 25,
    creation_date: new Date()
  },
  {
    product_id: 15,
    product_name: "אוזניות",
    product_description: "אוזניות אלחוטיות עם ביטול רעשים",
    status: true,
    current_stock_level: 30,
    creation_date: new Date()
  },
  {
    product_id: 16,
    product_name: "שעון חכם",
    product_description: "שעון חכם עם מעקב אחר פעילות גופנית",
    status: true,
    current_stock_level: 20,
    creation_date: new Date()
  }
];

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Connect to MongoDB and initialize admin user
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Drop all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    console.log('All collections cleared');

    try {
      // Add seed products
      const insertedProducts = await Product.insertMany(seedProducts);
      console.log('Added 16 seed products:', insertedProducts);
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }

    // Check if admin user exists
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        user_id: 1,
        user_name: 'admin',
        first_name: 'System',
        last_name: 'Admin',
        email: 'admin@example.com',
        birth_date: new Date('1990-01-01'),
        password: hashedPassword,
        status: true,
        isAdmin: true,
        Preferences: {
          Page_size: 50
        }
      });
      console.log('Admin user created');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

//


// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    const { user_name, first_name, last_name, email, birth_date, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ user_name }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the next user_id
    const lastUser = await User.findOne().sort({ user_id: -1 });
    const nextUserId = lastUser ? lastUser.user_id + 1 : 1;

    // Create new user
    const user = new User({
      user_id: nextUserId,
      user_name,
      first_name,
      last_name,
      email,
      birth_date: new Date(birth_date),
      password: hashedPassword,
      status: true,
      isAdmin: false,
      Preferences: {
        Page_size: 12
      }
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user.user_id, user_name: user.user_name, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        user_id: user.user_id, 
        user_name: user.user_name, 
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { user_name, password } = req.body;

    // Find user
    const user = await User.findOne({ user_name });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.user_id, user_name: user.user_name, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all products
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching all products');
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Search products - MUST be before /api/products/:id
app.get('/api/products/search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.query;
    console.log('Search request received:', {
      query,
      user: req.user,
      headers: req.headers
    });

    if (!query) {
      console.log('Empty search query received');
      return res.status(400).json({ message: 'נדרש טקסט חיפוש' });
    }

    // Validate query length
    if (query.length < 2) {
      console.log('Search query too short:', query);
      return res.status(400).json({ message: 'טקסט החיפוש חייב להכיל לפחות 2 תווים' });
    }

    console.log('Executing search query:', query);
    
    // First, check if we have any products in the database
    const totalProducts = await Product.countDocuments();
    console.log('Total products in database:', totalProducts);

    // Create case-insensitive regex for Hebrew text
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    console.log('Search regex created:', searchRegex);

    // Log all products for debugging
    const allProducts = await Product.find();
    console.log('All products in database:', allProducts.map(p => ({
      id: p.product_id,
      name: p.product_name,
      description: p.product_description
    })));

    // Search in both name and description, return all matches
    const products = await Product.find({
      $or: [
        { product_name: searchRegex },
        { product_description: searchRegex }
      ]
    }).sort({ product_id: 1 }); // Sort by product_id for consistent order

    console.log('Search results:', {
      query,
      foundCount: products.length,
      products: products.map(p => ({
        id: p.product_id,
        name: p.product_name,
        description: p.product_description
      }))
    });
    
    if (products.length === 0) {
      console.log('No products found for query:', query);
      return res.json([]);
    }

    // Send the products directly without any conversion
    res.json(products);
  } catch (error) {
    console.error('Error in search endpoint:', {
      error: error.message,
      stack: error.stack,
      query: req.query.query
    });
    res.status(500).json({ 
      message: 'שגיאה בחיפוש מוצרים',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get single product
app.get('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await Product.findOne({ product_id: parseInt(req.params.id) });
    console.log('Found product:', product);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { product_name, product_description, current_stock_level } = req.body;
    
    // Get the next product_id
    const lastProduct = await Product.findOne().sort({ product_id: -1 });
    const nextProductId = lastProduct ? lastProduct.product_id + 1 : 1;

    const product = new Product({
      product_id: nextProductId,
      product_name,
      product_description,
      current_stock_level,
      status: true
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete request received:', {
      product_id: req.params.id,
      headers: req.headers,
      user: req.user
    });
    
    // Log all products for debugging
    const allProducts = await Product.find();
    console.log('All products in database:', allProducts.map(p => ({
      _id: p._id,
      product_id: p.product_id,
      product_name: p.product_name,
      fullProduct: p
    })));

    // Try to find the product by product_id
    const product = await Product.findOne({ product_id: parseInt(req.params.id) });
    console.log('Product found:', product);

    if (!product) {
      console.log('Product not found with product_id:', req.params.id);
      return res.status(404).json({ 
        message: 'Product not found',
        requestedId: req.params.id,
        availableIds: allProducts.map(p => p.product_id)
      });
    }

    // Try to delete the product
    const deletedProduct = await Product.findOneAndDelete({ product_id: parseInt(req.params.id) });
    console.log('Product deleted successfully:', deletedProduct);
    
    res.json({ 
      message: 'Product deleted successfully',
      deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Update product
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    console.log('Update request received:', {
      product_id: req.params.id,
      updateData: req.body,
      user: req.user
    });

    const { product_name, product_description, current_stock_level, status } = req.body;
    
    // Convert product_id to number if it's a string
    const productId = typeof req.params.id === 'string' ? parseInt(req.params.id) : req.params.id;
    
    // Find and update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { product_id: productId },
      { 
        product_name,
        product_description,
        current_stock_level,
        status
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      console.log('Product not found for update:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product updated successfully:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 