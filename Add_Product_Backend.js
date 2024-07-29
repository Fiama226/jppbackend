const Module = require('module');
const multer = require('multer');
const path = require('path');
const uploadDir = path.join(__dirname, 'Images/products_image/');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);; // Specify the directory for storing uploads
    },
    filename: function (req, file, cb) {
      // Rename the uploaded file if needed (you can keep the original name as well)
      cb(null, file.originalname);
    }
  });

const ADD_Product_Backend = multer({ storage: storage });

module.exports = ADD_Product_Backend