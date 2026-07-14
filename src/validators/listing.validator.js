const { body, param } = require('express-validator');

const listingValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tiêu đề không được để trống.')
    .bail()
    .isLength({ min: 5, max: 150 })
    .withMessage('Tiêu đề phải có từ 5 đến 150 ký tự.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Mô tả không được để trống.')
    .bail()
    .isLength({ min: 20, max: 3000 })
    .withMessage('Mô tả phải có từ 20 đến 3000 ký tự.'),
  body('price')
    .notEmpty()
    .withMessage('Giá sản phẩm không được để trống.')
    .bail()
    .isFloat({ min: 0, max: 100000000000 })
    .withMessage('Giá phải là số từ 0 đến 100.000.000.000.')
    .bail()
    .custom((value) => Number.isFinite(Number(value)))
    .withMessage('Giá sản phẩm phải là một số hữu hạn.')
    .toFloat(),
  body('category')
    .notEmpty()
    .withMessage('Vui lòng chọn danh mục.')
    .bail()
    .isMongoId()
    .withMessage('Danh mục không hợp lệ.'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Địa điểm không được để trống.')
    .bail()
    .isLength({ min: 2, max: 150 })
    .withMessage('Địa điểm phải có từ 2 đến 150 ký tự.'),
  body('condition')
    .notEmpty()
    .withMessage('Tình trạng sản phẩm là bắt buộc.')
    .bail()
    .isIn(['new', 'used'])
    .withMessage('Tình trạng sản phẩm không hợp lệ.'),
];

const updateListingStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Trạng thái bài đăng là bắt buộc.')
    .bail()
    .isIn(['active', 'sold', 'hidden'])
    .withMessage('Trạng thái bài đăng không hợp lệ.'),
];

const listingIdValidator = [
  param('id').isMongoId().withMessage('Bài đăng không tồn tại.'),
];

module.exports = {
  createListingValidator: listingValidator,
  listingIdValidator,
  updateListingStatusValidator,
  updateListingValidator: listingValidator,
};
