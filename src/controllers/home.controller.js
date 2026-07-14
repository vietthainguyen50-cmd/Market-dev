const categoryService = require('../services/category.service');

const products = [
  {
    name: 'iPhone 13 128GB',
    price: 10500000,
    location: 'Quận 3, TP. Hồ Chí Minh',
    condition: 'Đã sử dụng',
    placeholder: 'Điện thoại',
    colorClass: 'placeholder-blue',
  },
  {
    name: 'Laptop Dell Inspiron 14',
    price: 8900000,
    location: 'Cầu Giấy, Hà Nội',
    condition: 'Còn mới',
    placeholder: 'Laptop',
    colorClass: 'placeholder-purple',
  },
  {
    name: 'Xe máy Honda Vision',
    price: 22500000,
    location: 'Hải Châu, Đà Nẵng',
    condition: 'Đã sử dụng',
    placeholder: 'Xe máy',
    colorClass: 'placeholder-orange',
  },
  {
    name: 'Bộ bàn ghế gỗ phòng khách',
    price: 4200000,
    location: 'Ninh Kiều, Cần Thơ',
    condition: 'Còn tốt',
    placeholder: 'Nội thất',
    colorClass: 'placeholder-green',
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);

const getHome = async (req, res, next) => {
  try {
    const categories = await categoryService.getActiveCategories();
    const featuredProducts = products.map((product) => ({
      ...product,
      formattedPrice: formatPrice(product.price),
    }));

    return res.render('home', {
      pageTitle: 'Mua bán đồ cũ an toàn, tiện lợi',
      categories,
      products: featuredProducts,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHome,
};
