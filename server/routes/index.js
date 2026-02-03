const Router = require('express');
const router = new Router();
const userRouter = require('./userRouter');
const portfolioRouter = require('./portfolioRouter');

router.use('/user', userRouter);
router.use('/portfolio', portfolioRouter);

module.exports = router;
