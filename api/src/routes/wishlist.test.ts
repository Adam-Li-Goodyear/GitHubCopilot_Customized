import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import wishlistRouter, { resetWishlistItems } from './wishlist';

let app: express.Express;

describe('Wishlist API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/wishlists', wishlistRouter);
        resetWishlistItems();
    });

    it('should return empty array for unknown email', async () => {
        const response = await request(app).get('/wishlists/unknown@example.com');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should add an item to the wishlist', async () => {
        const newItem = { email: 'user@example.com', productId: 1 };
        const response = await request(app).post('/wishlists').send(newItem);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newItem);
    });

    it('should return 409 when adding a duplicate item', async () => {
        const newItem = { email: 'user@example.com', productId: 1 };
        await request(app).post('/wishlists').send(newItem);
        const response = await request(app).post('/wishlists').send(newItem);
        expect(response.status).toBe(409);
    });

    it('should delete an item from the wishlist', async () => {
        const newItem = { email: 'user@example.com', productId: 1 };
        await request(app).post('/wishlists').send(newItem);
        const response = await request(app).delete('/wishlists/user@example.com/1');
        expect(response.status).toBe(204);
    });

    it('should return 404 when deleting a non-existing item', async () => {
        const response = await request(app).delete('/wishlists/user@example.com/999');
        expect(response.status).toBe(404);
    });

    it('should return 400 when email is missing', async () => {
        const response = await request(app).post('/wishlists').send({ productId: 1 });
        expect(response.status).toBe(400);
    });

    it('should return 400 when productId is missing', async () => {
        const response = await request(app).post('/wishlists').send({ email: 'user@example.com' });
        expect(response.status).toBe(400);
    });
});
