const categoryService = require('../services/category.service');
const listingService = require('../services/listing.service');
const presentListing = require('../utils/presentListing');

const getHome = async (req, res, next) => {
  try {
    const [categories, latestListings] = await Promise.all([
      categoryService.getActiveCategories(),
      listingService.getLatestListings(8),
    ]);

    return res.render('home', {
      pageTitle: 'Mua bán đồ cũ an toàn, tiện lợi',
      categories,
      listings: latestListings.map(presentListing),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHome,
};
