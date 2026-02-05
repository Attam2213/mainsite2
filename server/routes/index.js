const Router = require('express');
const router = new Router();
const userRouter = require('./userRouter');
const portfolioRouter = require('./portfolioRouter');
const billingRouter = require('./billingRouter');
const chatRouter = require('./chatRouter');

router.use('/user', userRouter);
router.use('/portfolio', portfolioRouter);
router.use('/billing', billingRouter);
router.use('/chat', chatRouter);

module.exports = router;
