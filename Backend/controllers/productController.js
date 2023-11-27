const Product = require('../models/product')

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

    // Create new product => /api/v1/admin/product/new    
    exports.newProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.create(req.body);
    
    res.status(201).json({
        success: true,
        product
    })
})


// Get all products => /api/v1/products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {

    const products = await Product.find();

res.status(200).json({
        success: true,
        count: products.length,
        products
})
})

// Get single product details   =>   /api/v1/product/:id

exports.getSingleProduct = catchAsyncErrors (async(req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler('Product not found', 404));
        
    }

    res.status(200).json({
        success: true,
        product
    })
})


// Update Product   =>   /api/v1/admin/product/:id
exports.updateProduct =catchAsyncErrors (async(req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler('Product not found', 404));
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
})

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
exports.deleteProduct = catchAsyncErrors (async(req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
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
});
