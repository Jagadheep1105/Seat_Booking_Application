"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const checkout_service_js_1 = require("../services/checkout.service.js");
const router = (0, express_1.Router)();
const checkoutSchema = zod_1.z.object({
    reservationId: zod_1.z.string().min(1, 'Reservation ID is required')
});
router.post('/', auth_middleware_js_1.requireAuth, async (req, res) => {
    try {
        const parsed = checkoutSchema.parse(req.body);
        const userId = req.user.userId;
        const result = await checkout_service_js_1.CheckoutService.processCheckout(userId, parsed.reservationId);
        res.status(200).json(result);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error('[Checkout Error]:', err);
        res.status(500).json({ error: 'Failed to complete checkout' });
    }
});
exports.default = router;
