const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true },
    email: {type: String, required: true, unique: true },
    image: {type: String, required: true, minLength: 4 },
    password: {type: String, required: true },
    products: [{type: mongoose.Types.ObjectId, required: true, ref: 'Product' }]
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);