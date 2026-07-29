const { validationResult } = require('express-validator');

const profileService = require('../services/profile.service');
const {
  deleteStoredAvatar,
  isManagedAvatarPath,
  uploadedAvatarToPublicPath,
} = require('../utils/avatarStorage');
const presentListing = require('../utils/presentListing');

const DEFAULT_AVATAR = '/images/default-avatar.svg';
const PROFILE_UPDATED_MESSAGE = 'Cập nhật hồ sơ thành công.';

const getFieldErrors = (req) => {
  const mappedErrors = validationResult(req).mapped();

  return Object.fromEntries(
    Object.entries(mappedErrors).map(([field, error]) => [field, error.msg]),
  );
};

const getOldInput = (data = {}) => ({
  name: typeof data.name === 'string' ? data.name : '',
  phone: typeof data.phone === 'string' ? data.phone : '',
  address: typeof data.address === 'string' ? data.address : '',
});

const getSafeAvatarUrl = (avatar) =>
  isManagedAvatarPath(avatar) ? avatar : DEFAULT_AVATAR;

const presentProfileUser = (profileUser) => ({
  ...profileUser,
  avatarUrl: getSafeAvatarUrl(profileUser.avatar),
  hasManagedAvatar: isManagedAvatarPath(profileUser.avatar),
  formattedCreatedAt: new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(profileUser.createdAt),
});

const createProfileNotFoundError = () => {
  const error = new Error(profileService.PROFILE_USER_NOT_FOUND_MESSAGE);
  error.status = 404;
  return error;
};

const renderEditProfile = (res, options) =>
  res.status(options.statusCode || 200).render('profile/edit', {
    pageTitle: 'Chỉnh sửa hồ sơ',
    profileUser: presentProfileUser(options.profileUser),
    errors: options.errors || {},
    oldInput: options.oldInput || getOldInput(options.profileUser),
    retryAvatar: Boolean(options.retryAvatar),
  });

const showProfile = async (req, res, next) => {
  try {
    const overview = await profileService.getProfileOverview(req.user._id);

    if (!overview) {
      return next(createProfileNotFoundError());
    }

    return res.render('profile/index', {
      pageTitle: 'Hồ sơ cá nhân',
      profileUser: presentProfileUser(overview.profileUser),
      stats: overview.stats,
      recentListings: overview.recentListings.map(presentListing),
      successMessage:
        req.query.updated === '1' ? PROFILE_UPDATED_MESSAGE : '',
    });
  } catch (error) {
    return next(error);
  }
};

const showEditProfile = async (req, res, next) => {
  try {
    const profileUser = await profileService.getProfileUser(req.user._id);

    if (!profileUser) {
      return next(createProfileNotFoundError());
    }

    return renderEditProfile(res, {
      profileUser,
      errors: {},
      oldInput: getOldInput(profileUser),
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const newAvatarPath = uploadedAvatarToPublicPath(req.file);
  const errors = getFieldErrors(req);
  const oldInput = getOldInput(req.body);
  const retryAvatar = Boolean(req.file || req.avatarUploadError);
  let profileUpdated = false;

  if (req.avatarUploadError) {
    errors.avatar = req.avatarUploadError.message;
  }

  try {
    const profileUser = await profileService.getProfileUser(req.user._id);

    if (!profileUser) {
      await deleteStoredAvatar(newAvatarPath);
      return next(createProfileNotFoundError());
    }

    if (Object.keys(errors).length > 0) {
      await deleteStoredAvatar(newAvatarPath);

      return renderEditProfile(res, {
        statusCode: 422,
        profileUser,
        errors,
        oldInput,
        retryAvatar,
      });
    }

    const oldAvatar = req.user.avatar || profileUser.avatar || '';
    const removeAvatar = ['1', 'on'].includes(req.body.removeAvatar);
    const finalAvatar = newAvatarPath || (removeAvatar ? '' : oldAvatar);

    try {
      await profileService.updateProfile(req.user._id, {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        avatar: finalAvatar,
      });
      profileUpdated = true;
    } catch (error) {
      await deleteStoredAvatar(newAvatarPath);
      throw error;
    }

    if (
      oldAvatar !== finalAvatar &&
      isManagedAvatarPath(oldAvatar)
    ) {
      await deleteStoredAvatar(oldAvatar);
    }

    return res.redirect(303, '/profile?updated=1');
  } catch (error) {
    if (!profileUpdated) {
      await deleteStoredAvatar(newAvatarPath);
    }

    return next(error);
  }
};

module.exports = {
  showEditProfile,
  showProfile,
  updateProfile,
};
