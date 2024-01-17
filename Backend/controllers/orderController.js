const Order = require('../models/order')
const Product = require('../models/product')

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

//Create a new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async(req,res,next) => {

    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

//Get single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async(req,res,next) => {
    const order = await Order.findById(req.params.id).populate('user','name email');

    if(!order){
        return next(new ErrorHandler('No order found with this ID',404));
    }

    res.status(200).json({
        success: true,
        order
    })
})

//Get logged in user orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async(req,res,next) => {
    const orders = await Order.find({user: req.user.id});

    res.status(200).json({
        success: true,
        orders
    })
})

// Get all orders - ADMIN => /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach(order => {
        // Assuming your order structure has ItemsPrice, taxPrice, and shippingPrice fields
        const { ItemsPrice, taxPrice, shippingPrice } = order;
        
        // Calculate totalAmount for each order
        const orderTotalAmount = ItemsPrice + taxPrice + shippingPrice;

        // Accumulate the totalAmount
        totalAmount += orderTotalAmount;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });
});

// Update / Process order - ADMIN => /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('You have already delivered this order', 400));
    }

    order.orderItems.forEach(async (item) => {
        await updateStock(item.product, item.quantity);
    });

    // Fix the syntax error here (use comma instead of semicolon)
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true,
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    if (product) {
        product.stock = product.stock - quantity;

        await product.save({ validateBeforeSave: false });
    }
}

// Delete order => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;

    // Check if the order exists
    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler('No order found with this ID', 404));
    }

    // Use deleteOne or remove on the Mongoose model
    await Order.deleteOne({ _id: orderId });

    res.status(200).json({
        success: true,
    });
});
