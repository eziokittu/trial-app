const uuid = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Product = require('../models/product');
const User = require('../models/user');

const getProductById = async (req, res, next) => {
	const productId = req.params.pid; // { pid: 'p1' }

	let product;
  try { 
		product = await Product.findById(productId);
	}
	catch (err) {
		const error = new HttpError(
			'Something went wrong, could not find a product!', 500
		);
		return next(error);
	}

  if (!product) {
    const error = new HttpError(
			'Could not find a product for the provided id.', 404
		);
		return next(error);
  }

  res.json({ product: product.toObject({ getters: true}) }); // => { product } => { product: product }
};

const getProductsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let products;
  let userWithProducts;
  try {
    userWithProducts = await User.findById(userId).populate('products');
  } catch (err) {
    const error = new HttpError(
      'Fetching products failed, please try again later',
      500
    );
    return next(error);
  }

  // if (!products || products.length === 0) {
  if (!userWithProducts || userWithProducts.products.length === 0) {
    return next(
      new HttpError('Could not find products for the provided user id.', 404)
    );
  }

  res.json({
    products: userWithProducts.producs.map(product =>
      product.toObject({ getters: true })
    )
  });
};

const createProduct = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
    return next(
		  new HttpError('Invalid inputs passed, please check your data!', 422)
    );
  }

	const { title, description, creator } = req.body;

	const createdProduct = new Product ({
		title,
		description,
		image: 'https://images.unsplash.com/photo-1597655601841-214a4cfe8b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1889&q=80',
		creator
	});

  // check if the user id provided exists or not
  let user;
  try{
    user = await User.findById(creator);
  }
  catch (err) {
    const error = new HttpError(
      'Creating product failed[1], please try again!', 500
    );
    console.log(err);
    return next(error);
  } 
  if (!user) {
    const error = new HttpError(
      'Cannot find user for the provided id', 404
    );
    return next(error);
  }
  // console.log(user);

	try {
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // await createdProduct.save({ session: sess });
    // user.products.push(createdProduct);
    // await user.save({ session: sess, validateModifiedOnly: true, });
    // await sess.commitTransaction();

    await createdProduct.save( /* { session: session } */ );
    user.products.push(createdProduct);
    await user.save( /* { session: session } */ );
  } 
	catch (err) {
		// console.log(err);
    const error = new HttpError(
      'Creating product failed[2], please try again.', 500
    );
    console.log(err);
    return next(error);
  }
	
	res.status(201).json({product: createdProduct});
};

const updateProduct = async (req, res, next) => {
	const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

	const { title, description } = req.body;
	const productId = req.params.pid;

	let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong[1], could not update product.',
      500
    );
    return next(error);
  }

	product.title = title;
	product.description = description;

	try {
    await product.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong[2], could not update product.', 500
    );
    return next(error);
  }
	
	res.status(200).json({ product: product.toObject({ getters: true }) });
};

const deleteProduct = async (req, res, next) => {
	const productId = req.params.pid;

	let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong[3], could not find product to delete. [1]',
      500
    );
    return next(error);
  }

  if (!product) {
    const error = new HttpError('Could not find product for this id.', 404);
    return next(error);
  }

  try {
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // await product.remove({ session: sess });
    // product.creator.products.pull(product);
    // await product.creator.save({ session: sess });
    // await sess.commitTransaction();

    await product.remove();
    product.creator.products.pull(product);
    await product.creator.save();
  } 
  catch (err) {
    const error = new HttpError(
      'Something went wrong[4], could not delete product.',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted product.' });
};

module.exports = {
	getProductById,
	getProductsByUserId,
	createProduct,
	updateProduct,
	deleteProduct
};

// {
// 	"title" : "test title 1",
// 	"description" : "test description 1",
// 	"creator" : "u2"
// }