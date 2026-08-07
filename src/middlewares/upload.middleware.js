const crypto = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');

const {
  LISTING_UPLOAD_DIRECTORY,
  deleteStoredFiles,
  uploadedFilesToPublicPaths,
} = require('../utils/fileStorage');
const {
  validateUploadedImageFile,
} = require('../utils/imageSignature');

const MAX_LISTING_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MIME_TYPE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

fs.mkdirSync(LISTING_UPLOAD_DIRECTORY, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, LISTING_UPLOAD_DIRECTORY);
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPE_EXTENSIONS[file.mimetype];
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (!MIME_TYPE_EXTENSIONS[file.mimetype]) {
    const error = new Error(
      'Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP.',
    );
    error.code = 'INVALID_IMAGE_TYPE';
    callback(error);
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_LISTING_IMAGES,
  },
});

const uploadArray = upload.array('images', MAX_LISTING_IMAGES);

const getUploadErrorMessage = (error) => {
  const messages = {
    LIMIT_FILE_SIZE: 'Ảnh tải lên vượt quá dung lượng tối đa 5 MB.',
    LIMIT_FILE_COUNT: 'Chỉ được tải tối đa 5 ảnh trong một lần.',
    LIMIT_UNEXPECTED_FILE:
      'Trường tải ảnh không hợp lệ hoặc số lượng ảnh vượt quá giới hạn.',
    INVALID_IMAGE_TYPE: 'Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP.',
  };

  return messages[error?.code] || 'Không thể tải ảnh lên. Vui lòng thử lại.';
};

const uploadListingImages = (req, res, next) => {
  uploadArray(req, res, (error) => {
    if (!error) {
      const uploadedFiles = Array.isArray(req.files) ? req.files : [];

      return Promise.all(uploadedFiles.map(validateUploadedImageFile))
        .then(async (validSignatures) => {
          if (validSignatures.every(Boolean)) {
            return next();
          }

          const storedPaths = uploadedFilesToPublicPaths(uploadedFiles);
          await deleteStoredFiles(storedPaths);
          req.files = [];
          req.uploadError = {
            code: 'INVALID_IMAGE_CONTENT',
            message:
              'Nội dung file không khớp định dạng JPG, PNG hoặc WEBP.',
          };
          return next();
        })
        .catch(async (validationError) => {
          await deleteStoredFiles(uploadedFilesToPublicPaths(uploadedFiles));
          req.files = [];
          return next(validationError);
        });
    }

    const storedPaths = uploadedFilesToPublicPaths(req.files);

    return deleteStoredFiles(storedPaths)
      .then(() => {
        req.files = [];
        req.uploadError = {
          code: error.code || 'UPLOAD_ERROR',
          message: getUploadErrorMessage(error),
        };
        return next();
      })
      .catch(next);
  });
};

module.exports = {
  MAX_IMAGE_SIZE_BYTES,
  MAX_LISTING_IMAGES,
  uploadListingImages,
};
