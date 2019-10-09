const mongoose = require('mongoose');

const types = mongoose.SchemaTypes;

const subcategorySchema = new mongoose.Schema({
	_id: types.ObjectId,
	code: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,		// REQUIRED
		maxlength: 30,
		unique: true
	},
	category: {
		type: types.ObjectId,
		ref: 'Category',
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true,			//REQUIRED
		minlength: 1,
		maxlength: 50
	},
	description: {
		type: String,
		trim: true,			//REQUIRED
		maxlength: 200
	},
	images: [types.ObjectId]
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;