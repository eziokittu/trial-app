const express = require('express');
const { check } = require('express-validator');
const productsController = require('../controllers/products-controllers');
const router = express.Router();

router.get('/:pid', productsController.getProductById);

router.get('/user/:uid', productsController.getProductsByUserId);

router.post(
	'/', 
	[
	check('title')
		.not()
		.isEmpty(),
	check('description')
		.isLength({min: 2})
	], 
	productsController.createProduct
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  productsController.updateProduct
);

router.delete('/:pid', productsController.deleteProduct);

module.exports = router;