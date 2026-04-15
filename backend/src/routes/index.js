/**
 * Route aggregator
 * Mounts all API sub-routers
 */

const express = require('express');
const router = express.Router();

// Import sub-routers
const networkRouter = require('./network');
const rpcRouter = require('./rpc');
const validatorsRouter = require('./validators');
const epochRouter = require('./epoch');
const alertsRouter = require('./alerts');
const bagsRouter = require('./bags');

// Mount sub-routers
router.use('/network', networkRouter);
router.use('/rpc', rpcRouter);
router.use('/validators', validatorsRouter);
router.use('/epoch', epochRouter);
router.use('/alerts', alertsRouter);
router.use('/bags', bagsRouter);

module.exports = router;
