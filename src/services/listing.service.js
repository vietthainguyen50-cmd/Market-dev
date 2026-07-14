const mongoose = require('mongoose');

const Category = require('../models/Category');
const Listing = require('../models/Listing');

const LISTING_NOT_FOUND = 'LISTING_NOT_FOUND';
const LISTING_NOT_FOUND_MESSAGE = 'Không tìm thấy bài đăng.';
const CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND';
const CATEGORY_NOT_FOUND_MESSAGE = 'Danh mục không tồn tại.';
const CATEGORY_INACTIVE = 'CATEGORY_INACTIVE';
const CATEGORY_INACTIVE_MESSAGE =
  'Danh mục này hiện không hoạt động. Vui lòng chọn danh mục khác.';
const INVALID_LISTING_STATUS = 'INVALID_LISTING_STATUS';
const INVALID_LISTING_STATUS_MESSAGE = 'Trạng thái bài đăng không hợp lệ.';
const ALLOWED_STATUSES = ['active', 'sold', 'hidden'];
const PUBLIC_STATUSES = ['active', 'sold'];

const createListingError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const populatePublicListing = (query) =>
  query
    .populate('category', 'name slug')
    .populate('seller', 'name avatar');

const getPublicListings = () =>
  populatePublicListing(
    Listing.find({ status: { $in: PUBLIC_STATUSES } })
      .select(
        'title description price category seller location condition images status createdAt updatedAt',
      )
      .sort({ createdAt: -1 }),
  ).lean();

const getLatestListings = (limit = 8) =>
  populatePublicListing(
    Listing.find({ status: 'active' })
      .select(
        'title price category seller location condition images status createdAt',
      )
      .sort({ createdAt: -1 })
      .limit(limit),
  ).lean();

const getListingById = (listingId) => {
  if (!mongoose.isValidObjectId(listingId)) {
    return null;
  }

  return Listing.findById(listingId)
    .select(
      'title description price category seller location condition images status createdAt updatedAt',
    )
    .populate('category', 'name slug status')
    .populate('seller', 'name avatar phone')
    .lean();
};

const getListingDocumentById = (listingId) => {
  if (!mongoose.isValidObjectId(listingId)) {
    return null;
  }

  return Listing.findById(listingId).select('_id seller status');
};

const getListingsByCategory = (category) => {
  const categoryId = category?._id || category;

  if (!mongoose.isValidObjectId(categoryId)) {
    return [];
  }

  return populatePublicListing(
    Listing.find({
      category: categoryId,
      status: { $in: PUBLIC_STATUSES },
    })
      .select(
        'title description price category seller location condition images status createdAt updatedAt',
      )
      .sort({ createdAt: -1 }),
  ).lean();
};

const getListingsBySeller = (sellerId) => {
  if (!mongoose.isValidObjectId(sellerId)) {
    return [];
  }

  return populatePublicListing(
    Listing.find({ seller: sellerId })
      .select(
        'title description price category seller location condition images status createdAt updatedAt',
      )
      .sort({ createdAt: -1 }),
  ).lean();
};

const getActiveCategory = async (categoryId) => {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw createListingError(CATEGORY_NOT_FOUND, CATEGORY_NOT_FOUND_MESSAGE);
  }

  const category = await Category.findById(categoryId).select('_id status');

  if (!category) {
    throw createListingError(CATEGORY_NOT_FOUND, CATEGORY_NOT_FOUND_MESSAGE);
  }

  if (category.status !== 'active') {
    throw createListingError(CATEGORY_INACTIVE, CATEGORY_INACTIVE_MESSAGE);
  }

  return category;
};

const normalizeListingData = (data) => ({
  title: typeof data.title === 'string' ? data.title.trim() : '',
  description:
    typeof data.description === 'string' ? data.description.trim() : '',
  price: Number(data.price),
  category: data.category,
  location: typeof data.location === 'string' ? data.location.trim() : '',
  condition: data.condition,
});

const createListing = async (data) => {
  const normalizedData = normalizeListingData(data);
  const category = await getActiveCategory(normalizedData.category);

  return Listing.create({
    title: normalizedData.title,
    description: normalizedData.description,
    price: normalizedData.price,
    category: category._id,
    seller: data.seller,
    location: normalizedData.location,
    condition: normalizedData.condition,
    images: [],
    status: 'active',
  });
};

const updateListing = async (listingId, data) => {
  if (!mongoose.isValidObjectId(listingId)) {
    throw createListingError(LISTING_NOT_FOUND, LISTING_NOT_FOUND_MESSAGE);
  }

  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw createListingError(LISTING_NOT_FOUND, LISTING_NOT_FOUND_MESSAGE);
  }

  const normalizedData = normalizeListingData(data);
  const category = await getActiveCategory(normalizedData.category);

  listing.title = normalizedData.title;
  listing.description = normalizedData.description;
  listing.price = normalizedData.price;
  listing.category = category._id;
  listing.location = normalizedData.location;
  listing.condition = normalizedData.condition;

  return listing.save();
};

const updateListingStatus = async (listingId, status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw createListingError(
      INVALID_LISTING_STATUS,
      INVALID_LISTING_STATUS_MESSAGE,
    );
  }

  if (!mongoose.isValidObjectId(listingId)) {
    throw createListingError(LISTING_NOT_FOUND, LISTING_NOT_FOUND_MESSAGE);
  }

  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw createListingError(LISTING_NOT_FOUND, LISTING_NOT_FOUND_MESSAGE);
  }

  listing.status = status;
  return listing.save();
};

const hideListing = (listingId) => updateListingStatus(listingId, 'hidden');

module.exports = {
  CATEGORY_INACTIVE,
  CATEGORY_INACTIVE_MESSAGE,
  CATEGORY_NOT_FOUND,
  CATEGORY_NOT_FOUND_MESSAGE,
  INVALID_LISTING_STATUS,
  INVALID_LISTING_STATUS_MESSAGE,
  LISTING_NOT_FOUND,
  LISTING_NOT_FOUND_MESSAGE,
  createListing,
  getLatestListings,
  getListingById,
  getListingDocumentById,
  getListingsByCategory,
  getListingsBySeller,
  getPublicListings,
  hideListing,
  updateListing,
  updateListingStatus,
};
