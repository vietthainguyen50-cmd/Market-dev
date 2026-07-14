const { validationResult } = require('express-validator');

const categoryService = require('../services/category.service');
const listingService = require('../services/listing.service');
const presentListing = require('../utils/presentListing');

const CREATED_MESSAGE = 'Tạo bài đăng thành công.';
const UPDATED_MESSAGE = 'Cập nhật bài đăng thành công.';
const STATUS_CHANGED_MESSAGE = 'Thay đổi trạng thái bài đăng thành công.';
const HIDDEN_MESSAGE = 'Bài đăng đã được ẩn.';

const getFieldErrors = (req) => {
  const mappedErrors = validationResult(req).mapped();

  return Object.fromEntries(
    Object.entries(mappedErrors).map(([field, error]) => [field, error.msg]),
  );
};

const getOldInput = (data = {}) => ({
  title: typeof data.title === 'string' ? data.title : '',
  description:
    typeof data.description === 'string' ? data.description : '',
  price:
    typeof data.price === 'string' || typeof data.price === 'number'
      ? String(data.price)
      : '',
  category:
    typeof data.category === 'string'
      ? data.category
      : data.category?._id?.toString() || data.category?.toString() || '',
  location: typeof data.location === 'string' ? data.location : '',
  condition: typeof data.condition === 'string' ? data.condition : 'used',
});

const renderNotFound = (req, res) =>
  res.status(404).render('errors/404', {
    pageTitle: 'Không tìm thấy trang',
    requestedUrl: req.originalUrl,
  });

const getSellerId = (listing) => listing.seller?._id || listing.seller;

const getSafeAvatar = (avatar) => {
  if (typeof avatar !== 'string') {
    return '';
  }

  const value = avatar.trim();
  const isLocalPath = value.startsWith('/') && !value.startsWith('//');
  const isHttpUrl = /^https?:\/\//i.test(value);

  return isLocalPath || isHttpUrl ? value : '';
};

const isListingOwner = (listing, user) =>
  Boolean(user && getSellerId(listing)?.toString() === user._id.toString());

const canManageListing = (listing, user) =>
  isListingOwner(listing, user) || user?.role === 'admin';

const getDetailSuccessMessage = (query = {}) => {
  if (query.created === '1') {
    return CREATED_MESSAGE;
  }

  if (query.updated === '1') {
    return UPDATED_MESSAGE;
  }

  return '';
};

const getMyListingsSuccessMessage = (query = {}) => {
  if (query.created === '1') {
    return CREATED_MESSAGE;
  }

  if (query.updated === '1') {
    return UPDATED_MESSAGE;
  }

  if (query.statusChanged === '1') {
    return STATUS_CHANGED_MESSAGE;
  }

  if (query.hidden === '1') {
    return HIDDEN_MESSAGE;
  }

  return '';
};

const getCategoriesForForm = async (currentCategory) => {
  const categories = await categoryService.getActiveCategories();
  const currentCategoryId = currentCategory?._id?.toString();

  if (
    currentCategory &&
    !categories.some(
      (category) => category._id.toString() === currentCategoryId,
    )
  ) {
    return [...categories, currentCategory];
  }

  return categories;
};

const renderListingDetail = (req, res, listing, options = {}) => {
  const isOwner = isListingOwner(listing, req.user);
  const canManage = canManageListing(listing, req.user);
  const presentedListing = presentListing(listing);
  presentedListing.sellerAvatar = getSafeAvatar(listing.seller?.avatar);

  return res.status(options.statusCode || 200).render('listings/show', {
    pageTitle: listing.title,
    listing: presentedListing,
    isOwner,
    canManage,
    errors: options.errors || {},
    successMessage: options.successMessage || '',
  });
};

const renderMyListings = async (req, res, options = {}) => {
  const listings = await listingService.getListingsBySeller(req.user._id);

  return res.status(options.statusCode || 200).render('listings/my-listings', {
    pageTitle: 'Bài đăng của tôi',
    listings: listings.map(presentListing),
    successMessage: options.successMessage || '',
    errors: options.errors || {},
  });
};

const isCategoryError = (error) =>
  error.code === listingService.CATEGORY_NOT_FOUND ||
  error.code === listingService.CATEGORY_INACTIVE;

const listListings = async (req, res, next) => {
  try {
    const listings = await listingService.getPublicListings();

    return res.render('listings/index', {
      pageTitle: 'Sản phẩm đang được rao bán',
      listings: listings.map(presentListing),
    });
  } catch (error) {
    return next(error);
  }
};

const showListing = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.params.id);

    if (!listing) {
      return renderNotFound(req, res);
    }

    if (listing.status === 'hidden' && !canManageListing(listing, req.user)) {
      return renderNotFound(req, res);
    }

    return renderListingDetail(req, res, listing, {
      successMessage: getDetailSuccessMessage(req.query),
    });
  } catch (error) {
    return next(error);
  }
};

const showCreateForm = async (req, res, next) => {
  try {
    const categories = await getCategoriesForForm();

    return res.render('listings/create', {
      pageTitle: 'Đăng sản phẩm',
      categories,
      canSubmit: categories.length > 0,
      errors: {},
      oldInput: getOldInput(),
    });
  } catch (error) {
    return next(error);
  }
};

const createListing = async (req, res, next) => {
  const errors = getFieldErrors(req);
  const oldInput = getOldInput(req.body);

  try {
    const categories = await getCategoriesForForm();

    if (Object.keys(errors).length > 0) {
      return res.status(422).render('listings/create', {
        pageTitle: 'Đăng sản phẩm',
        categories,
        canSubmit: categories.length > 0,
        errors,
        oldInput,
      });
    }

    try {
      const listing = await listingService.createListing({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        location: req.body.location,
        condition: req.body.condition,
        seller: req.user._id,
      });

      return res.redirect(303, `/listings/${listing._id}?created=1`);
    } catch (error) {
      if (isCategoryError(error)) {
        return res.status(422).render('listings/create', {
          pageTitle: 'Đăng sản phẩm',
          categories,
          canSubmit: categories.length > 0,
          errors: { category: error.message },
          oldInput,
        });
      }

      throw error;
    }
  } catch (error) {
    return next(error);
  }
};

const showEditForm = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.listing._id);

    if (!listing) {
      return renderNotFound(req, res);
    }

    const categories = await getCategoriesForForm(listing.category);

    return res.render('listings/edit', {
      pageTitle: 'Chỉnh sửa bài đăng',
      listing,
      categories,
      errors: {},
      oldInput: getOldInput(listing),
    });
  } catch (error) {
    return next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.listing._id);

    if (!listing) {
      return renderNotFound(req, res);
    }

    const categories = await getCategoriesForForm(listing.category);
    const errors = getFieldErrors(req);
    const oldInput = getOldInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(422).render('listings/edit', {
        pageTitle: 'Chỉnh sửa bài đăng',
        listing,
        categories,
        errors,
        oldInput,
      });
    }

    try {
      await listingService.updateListing(req.listing._id, {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        location: req.body.location,
        condition: req.body.condition,
      });

      return res.redirect(303, `/listings/${req.listing._id}?updated=1`);
    } catch (error) {
      if (isCategoryError(error)) {
        return res.status(422).render('listings/edit', {
          pageTitle: 'Chỉnh sửa bài đăng',
          listing,
          categories,
          errors: { category: error.message },
          oldInput,
        });
      }

      if (error.code === listingService.LISTING_NOT_FOUND) {
        return renderNotFound(req, res);
      }

      throw error;
    }
  } catch (error) {
    return next(error);
  }
};

const updateListingStatus = async (req, res, next) => {
  const errors = getFieldErrors(req);

  try {
    if (Object.keys(errors).length > 0) {
      const listing = await listingService.getListingById(req.listing._id);

      if (!listing) {
        return renderNotFound(req, res);
      }

      return renderListingDetail(req, res, listing, {
        statusCode: 422,
        errors: { general: errors.status },
      });
    }

    await listingService.updateListingStatus(req.listing._id, req.body.status);
    return res.redirect(303, '/my-listings?statusChanged=1');
  } catch (error) {
    if (error.code === listingService.LISTING_NOT_FOUND) {
      return renderNotFound(req, res);
    }

    if (error.code === listingService.INVALID_LISTING_STATUS) {
      try {
        return await renderMyListings(req, res, {
          statusCode: 422,
          errors: { general: error.message },
        });
      } catch (renderError) {
        return next(renderError);
      }
    }

    return next(error);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    await listingService.hideListing(req.listing._id);
    return res.redirect(303, '/my-listings?hidden=1');
  } catch (error) {
    if (error.code === listingService.LISTING_NOT_FOUND) {
      return renderNotFound(req, res);
    }

    return next(error);
  }
};

const listMyListings = async (req, res, next) => {
  try {
    return await renderMyListings(req, res, {
      successMessage: getMyListingsSuccessMessage(req.query),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createListing,
  deleteListing,
  listListings,
  listMyListings,
  showCreateForm,
  showEditForm,
  showListing,
  updateListing,
  updateListingStatus,
};
