"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Health Check Endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    });
});
// TODO: Mount other route modules here
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/admin', adminRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map