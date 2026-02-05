const Router = require('express');
const router = new Router();
const { ServiceController, InvoiceController } = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');

const serviceController = new ServiceController();
const invoiceController = new InvoiceController();

// Маршруты для услуг (только для администратора)
router.post('/services', authMiddleware, serviceController.createService);
router.get('/services', authMiddleware, serviceController.getAllServices);
router.put('/services/:id', authMiddleware, serviceController.updateService);
router.delete('/services/:id', authMiddleware, serviceController.deleteService);

// Маршруты для счетов
router.post('/invoices', authMiddleware, invoiceController.createInvoice);
router.get('/invoices/my', authMiddleware, invoiceController.getUserInvoices);
router.get('/invoices', authMiddleware, invoiceController.getAllInvoices);
router.post('/invoices/:id/pay', authMiddleware, invoiceController.payInvoice);
router.post('/invoices/:id/cancel', authMiddleware, invoiceController.cancelInvoice);

// Статистика (только для администратора)
router.get('/statistics', authMiddleware, invoiceController.getStatistics);

module.exports = router;