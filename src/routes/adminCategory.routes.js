const express = require('express');

const categoryController = require('../controllers/category.controller');
const { requireAdmin } = require('../middlewares/admin.middleware');
const {
  createCategoryValidator,
  updateCategoryStatusValidator,
  updateCategoryValidator,
} = require('../validators/category.validator');

const router = express.Router();

router.use(requireAdmin);

router.get('/', categoryController.listAdminCategories);
router.get('/create', categoryController.showCreateCategoryForm);
router.post('/', createCategoryValidator, categoryController.createCategory);
router.get('/:id/edit', categoryController.showEditCategoryForm);
router.put('/:id', updateCategoryValidator, categoryController.updateCategory);
router.patch(
  '/:id/status',
  updateCategoryStatusValidator,
  categoryController.updateCategoryStatus,
);

module.exports = router;
