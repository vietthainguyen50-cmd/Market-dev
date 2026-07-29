const express = require('express');

const categoryController = require('../controllers/category.controller');
const { requireAdmin } = require('../middlewares/admin.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const {
  uploadCategoryImage,
} = require('../middlewares/categoryImage.middleware');
const {
  createCategoryValidator,
  updateCategoryStatusValidator,
  updateCategoryValidator,
} = require('../validators/category.validator');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/', categoryController.listAdminCategories);
router.get('/create', categoryController.showCreateCategoryForm);
router.post(
  '/',
  uploadCategoryImage,
  createCategoryValidator,
  categoryController.createCategory,
);
router.get('/:id/edit', categoryController.showEditCategoryForm);
router.put(
  '/:id',
  uploadCategoryImage,
  updateCategoryValidator,
  categoryController.updateCategory,
);
router.patch(
  '/:id/status',
  updateCategoryStatusValidator,
  categoryController.updateCategoryStatus,
);

module.exports = router;
