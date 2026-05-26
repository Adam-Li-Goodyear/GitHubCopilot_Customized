/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       required: [email, productId]
 *       properties:
 *         email:
 *           type: string
 *         productId:
 *           type: integer
 */
export interface WishlistItem {
  email: string;
  productId: number;
}
