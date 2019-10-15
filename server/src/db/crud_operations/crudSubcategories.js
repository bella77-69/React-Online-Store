const createError = require('http-errors');

const { ObjectID } = require('mongodb');

const { mongoose } = require('../mongoose');

const MongoGridFsStorage = require('mongo-gridfs-storage'); /* WE USE THIS MODULE JUST FOR READ FILES FROM THE GRIDFSBUCKET */

const Subcategory = require('../models/Subcategory');

const Category = require('../models/Category');

const db = mongoose.connection;


const addSubcategory = (code, categoryId, name, description) => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			Subcategory.findOne({ code }).then(res => {

				if(res) {

					throw createError(409, 'CODE ALREADY EXISTS');

				}

				if (!ObjectID.isValid(categoryId)) {
				
					throw createError(400, 'INVALID ID');
						
				}

				if(!description) {
					description = null;
				}

				return Category.findById(categoryId);

			}).then(res => {

				if (!res) {
					
					throw createError(404, 'ID NOT FOUND');
					
				}

				return Subcategory.create({
					_id: new ObjectID(),
					code,
					category: ObjectID.createFromHexString(categoryId),
					name,
					description					
				})

			}).then(res => {

				resolve(res);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);

			});


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}	

	});

};


const deleteSubcategory = subcategoryId => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(subcategoryId)) {
				
				throw createError(400, 'INVALID ID');
					
			}

			Subcategory.findByIdAndDelete(subcategoryId).then(res => {

				if (!res) {
					
					throw createError(404, 'ID NOT FOUND');
					
				}
				
				const images = res.images;

				if(images.length > 0) {

					images.forEach(id => {

						deleteImageFromStore(id.toString());

					});

				}

				return resolve(res);

			}).catch(err => {
				
				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});



}


const deleteAllSubCategories = () => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {
			
			Subcategory.find({}).then(all => {
							
				const docs = all;

				if(docs.length > 0) {

					docs.forEach(doc => {

						const images = doc.images;

						if(images.length > 0) {

							images.forEach(id => {
		
								deleteImageFromStore(id.toString());
		
							});
		
						}

					});
				}
				
				return Subcategory.deleteMany({});

			}).then(() => {

			
				resolve();


			}).catch(err => {
				
				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});

};


const updateSubcategory = (subcategoryId, filter) => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(subcategoryId)) {
				
				throw createError(400, 'INVALID ID');
					
			}
				
			if (filter) {

				if (typeof filter === 'object') {

					let result = 0;

					const filterParamsCount = Object.keys(filter).length;
	
					Object.keys(filter).forEach(item => {
									
						Subcategory.schema.eachPath(pathname => {
	
							if (item === pathname) result +=1;
	
						});
	
					});
	
					if (result < filterParamsCount) {
	
						throw createError(400, 'BAD FILTER PARAMETERS');
					
					}


				} else {

					throw createError(400, 'FILTER MUST BE AN OBJECT');

				}				

			} else {

				throw createError(400, 'MISSING FILTER');

			}

			Subcategory.findByIdAndUpdate(subcategoryId, filter, { new: true }).then(res => {

				if (!res) {
					
					throw createError(404, 'ID NOT FOUND');
					
				}

				return resolve(res);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});

}

const getSubcategories = categoryId => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(categoryId)) {
				
				throw createError(400, 'INVALID ID');
					
			}
						

			Category.findById(categoryId).then(res => {

				if (!res) {
					
					throw createError(404, 'ID NOT FOUND');
					
				}

				return Subcategory.find({ category: categoryId }).populate({ path: 'category', select: 'name' }).sort('name').exec();

			}).then(subcategories => {
				
				return resolve(subcategories);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});


};


const getAllSubcategories = () => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

					
			Subcategory.find({}).populate({ path: 'category', select: 'name' }).sort('name').exec().then(subcategories => {
				
				return resolve(subcategories);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});


};


const addSubcategoryImage = (subcategoryId, imageId ) => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(subcategoryId)) {
				
				throw createError(400, 'INVALID ID');
				
			} 

			Subcategory.findById(subcategoryId).then(res => {


				if (!res) {
					
					throw createError(404, 'ID NOT FOUND');
					
				}

				res.images.push(imageId);

				return res.save();


			}).then(res => {

				resolve(res);


			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})

		
		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});

};


const getSubcategoryImages = (subcategoryId) => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(subcategoryId)) {
				
				throw createError(400, 'INVALID ID');
					
			} 


			Subcategory.findById(subcategoryId).then(res => {

				if (!res) {
					
					throw createError(404, 'ID NOT FOUND');
					
				}

				return resolve(res.images);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});

};


const deleteSubcategoryImage = (subcategoryId, imageId) => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			Subcategory.findById(subcategoryId).then(res => {

				if (!res) {
					
					throw createError(404, 'ITEM ID NOT FOUND');
					
				}
				
				const img = res.images.find(item => item.toString() === imageId.toString())
				
				if(!img) {

					throw createError(404, 'IMAGE ID NOT FOUND');

				}

				deleteImageFromStore(imageId.toString());

				const images = res.images.filter(item => item.toString() !== imageId.toString());
				
				res.images = images;

				return res.save();

			}).then(res => {
				
				resolve(res);					

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})
		
		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});

};


const deleteAllSubcategoryImages = (subcategoryId) => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			Subcategory.findById(subcategoryId).then(res => {

				if (!res) {
					
					throw createError(404, 'ITEM ID NOT FOUND');
					
				}
				
				if(res.images.length > 0 ) {

					res.images.forEach(id => {

						deleteImageFromStore(id.toString());

					});

				}
				
				res.images = [];

				return res.save();

			}).then(res => {				

				resolve(res);					

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})
		
		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});

};


const updateSubcategoryImages = (subcategoryId, imagesArray) => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {
			
			Subcategory.findById(subcategoryId).then(res => {

				if (!res) {
					
					throw createError(404, 'ITEM ID NOT FOUND');
					
				}	

				res.images = imagesArray;

				return res.save();

			}).then(res => {

				resolve(res);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})

		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}
	});

};


const getImageFromStore = imageId => {  // IMPORTANT  argument: imageId is STRING AND NOT ObjectID(String) SO IT WILL BE CONVERTED TO ObjectdID LATER

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(imageId)) {
				
				throw createError(400, 'INVALID ID');
						
			} 

			let gfs = new MongoGridFsStorage(mongoose.connection.db, { bucketName: 'images' });

			const filter = {
				_id: ObjectID.createFromHexString(imageId)
			};
			
			gfs.read(filter).then(fileBuffer => {

				resolve(fileBuffer);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);

			});

		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}	
	});
};

const deleteImageFromStore = imageId => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(imageId)) {
				
				throw createError(400, 'INVALID ID');
						
			} 

			let gfs = new MongoGridFsStorage(mongoose.connection.db, { bucketName: 'images' });

			const filter = {
				id: ObjectID.createFromHexString(imageId)
			};
			
			gfs.delete(filter).then(() => {

				resolve();

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);

			});

		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}	
	});
};


const getSubcategoryById = subcategoryId => {

	return new Promise((resolve, reject) => {

		if (db.readyState === 1 || db.readyState === 2) {

			// Case No. 2 : Invalid ID

			if (!ObjectID.isValid(subcategoryId)) {
				
				throw createError(400, 'INVALID ID');
					
			}
						

			Subcategory.findById(subcategoryId).then(res => {

				if (!res) {
					
					throw createError(404, 'ID NOT FOUND');
					
				}

				return resolve(res);

			}).catch(err => {

				if (!err.status) {

					err.status = 500;

				}

				reject(err);
			})


		} else {

			throw createError(500, 'DB CONNECTION ERROR!!');

		}

	});

};


module.exports = {
	addSubcategory,
	deleteSubcategory,
	deleteAllSubCategories,
	updateSubcategory,
	getSubcategories,
	getSubcategoryById,
	addSubcategoryImage,
	getSubcategoryImages,
	deleteSubcategoryImage,
	deleteAllSubcategoryImages,
	updateSubcategoryImages,
	getImageFromStore,
	deleteImageFromStore,
	getAllSubcategories
};

