const express = require('express');
const router = express.Router();
const { createService, getServices, updateService, deactivateService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { serviceSchema } = require('../validators/schemas');

router.route('/')
  .post(protect, authorize('provider'), validate(serviceSchema), createService)
  .get(protect, authorize('provider'), getServices);

router.route('/:id')
  .put(protect, authorize('provider'), validate(serviceSchema), updateService)
  .delete(protect, authorize('provider'), deactivateService);

module.exports = router;
