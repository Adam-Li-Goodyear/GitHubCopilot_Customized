/**
 * @swagger
 * tags:
 *   name: Wishlists
 *   description: API endpoints for managing wishlists
 */

/**
 * @swagger
 * /api/wishlists/{email}:
 *   get:
 *     summary: Get wishlist items for a user
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *     responses:
 *       200:
 *         description: List of wishlist items for the user (empty array if none found)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItem'
 *
 * /api/wishlists:
 *   post:
 *     summary: Add an item to a user's wishlist
 *     tags: [Wishlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistItem'
 *     responses:
 *       201:
 *         description: Wishlist item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       400:
 *         description: Missing or invalid fields
 *       409:
 *         description: Item already in wishlist
 *
 * /api/wishlists/{email}/{productId}:
 *   delete:
 *     summary: Remove an item from a user's wishlist
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Wishlist item removed successfully
 *       404:
 *         description: Wishlist item not found
 */

import express from 'express';
import { WishlistItem } from '../models/wishlistItem';
import { wishlistItems as seedWishlistItems } from '../seedData';

const router = express.Router();

let wishlistItems: WishlistItem[] = [...seedWishlistItems];

// Add reset function for testing
export const resetWishlistItems = () => {
  wishlistItems = [];
};

// Get all wishlist items for a user by email
router.get('/:email', (req, res) => {
  const { email } = req.params;
  const items = wishlistItems.filter(item => item.email === email);
  res.json(items);
});

// Add an item to the wishlist
router.post('/', (req, res) => {
  const { email, productId } = req.body as { email: unknown; productId: unknown };

  if (!email || typeof email !== 'string' || email.trim() === '') {
    res.status(400).json({ error: 'email is required and must be a non-empty string' });
    return;
  }

  if (productId === undefined || productId === null || !Number.isInteger(productId) || (productId as number) <= 0) {
    res.status(400).json({ error: 'productId is required and must be a positive integer' });
    return;
  }

  const existingItem = wishlistItems.find(
    item => item.email === email && item.productId === productId
  );

  if (existingItem) {
    res.status(409).json({ error: 'Item already in wishlist' });
    return;
  }

  const newItem: WishlistItem = { email: email.trim(), productId: productId as number };
  wishlistItems.push(newItem);
  res.status(201).json(newItem);
});

// Remove an item from the wishlist
router.delete('/:email/:productId', (req, res) => {
  const { email } = req.params;
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    res.status(400).json({ error: 'productId must be an integer' });
    return;
  }

  const index = wishlistItems.findIndex(
    item => item.email === email && item.productId === productId
  );

  if (index === -1) {
    res.status(404).send('Wishlist item not found');
    return;
  }

  wishlistItems.splice(index, 1);
  res.status(204).send();
});

export default router;
