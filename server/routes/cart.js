const express = require('express');
const Cart = require('../models/Cart');
const router = express.Router();

// Add to cart
router.post('/', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [{ product: productId }] });
    } else {
      const existingItem = cart.items.find(item => item.product == productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ product: productId });
      }
    }
    
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;