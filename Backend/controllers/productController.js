const Product = require('../models/product')

const ErrorHandler = require('../utils/errorhandler.js');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');
const APIFeatures = require('../utils/apiFeatures');

    // Create new product => /api/v1/admin/product/new    
    exports.newProduct = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id;
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
        success: true,
        product
    })
})


// Get all products => /api/v1/products?keyword=apple
exports.getProducts = async (req, res, next) => {

     const resPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
                            .search()
                            .filter()
                            .pagination(resPerPage)
    const products = await apiFeatures.query;

    
        res.status(200).json({
            success: true,
            productsCount,
            products
    })

    


}

// Get single product details   =>   /api/v1/product/:id

exports.getSingleProduct = async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler('Product not found', 404));
        
    }

    res.status(200).json({
        success: true,
        product
    })
}


// Update Product   =>   /api/v1/admin/product/:id
exports.updateProduct = async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        product
    })
}

// Delete Product   =>   /api/v1/admin/product/:id
// exports.deleteProduct = async (req, res, next) => {

//     const product = await Product.findById(req.params.id);

//     if(!product) {
//         return res.status(404).json({
//             success: false,
//             message: 'Product not found'
//         })
//     }

//     await product.remove();

//     res.status(200).json({
//         success: true,
//         message: 'Product is deleted.'
//     })
// }

// Delete Product   =>   /api/v1/admin/product/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await Product.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Product is deleted.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncErrors( async(req, res, next) => {
   
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        const product = await Product.findById(productId);

        const isReviewed = product.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach(review => {
                if (review.user.toString() === req.user._id.toString()) {
                    review.comment = comment;
                    review.rating = rating;
                }
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        product.ratings =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true
        });
    } 
);

// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors( async(req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
});

// Delete Product Review => /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});
