const express = require('express');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth'); // Import auth middleware
const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product'); // Populate product details
    res.json(cart || { user: req.userId, items: [] }); // Return empty cart if not found
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to cart or update quantity
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body; // Default quantity to 1
    let cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      // Create new cart if none exists for the user
      cart = new Cart({ user: req.userId, items: [{ product: productId, quantity }] });
    } else {
      const existingItem = cart.items.find(item => item.product == productId);
      if (existingItem) {
        // If product exists, increase quantity
        existingItem.quantity += quantity;
      } else {
        // If product does not exist, add it to items
        cart.items.push({ product: productId, quantity });
      }
    }
    
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/:productId', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Filter out the item to be removed
    cart.items = cart.items.filter(item => item.product != req.params.productId);
    
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;