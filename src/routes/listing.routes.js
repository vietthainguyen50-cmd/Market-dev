const express = require('express');

const listingController = require('../controllers/listing.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const {
  loadListing,
  requireListingOwnerOrAdmin,
} = require('../middlewares/listing.middleware');
const {
  createListingValidator,
  updateListingStatusValidator,
  updateListingValidator,
} = require('../validators/listing.validator');

const router = express.Router();

router.get('/my-listings', requireAuth, listingController.listMyListings);

router.get('/listings', listingController.listListings);
router.get('/listings/create', requireAuth, listingController.showCreateForm);
router.post(
  '/listings',
  requireAuth,
  createListingValidator,
  listingController.createListing,
);

router.get(
  '/listings/:id/edit',
  requireAuth,
  loadListing,
  requireListingOwnerOrAdmin,
  listingController.showEditForm,
);
router.put(
  '/listings/:id',
  requireAuth,
  loadListing,
  requireListingOwnerOrAdmin,
  updateListingValidator,
  listingController.updateListing,
);
router.patch(
  '/listings/:id/status',
  requireAuth,
  loadListing,
  requireListingOwnerOrAdmin,
  updateListingStatusValidator,
  listingController.updateListingStatus,
);
router.delete(
  '/listings/:id',
  requireAuth,
  loadListing,
  requireListingOwnerOrAdmin,
  listingController.deleteListing,
);

router.get('/listings/:id', listingController.showListing);

module.exports = router;
