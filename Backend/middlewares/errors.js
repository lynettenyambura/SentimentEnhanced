// Using CommonJS syntax for export
module.exports = (err, _, res, __) => {
    err.statusCode = err.statusCode || 500;
    
    if(process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });
    }

    if (process.env.NODE_ENV === 'PRODUCTION') {
        let error = { ...err };
        error.message = err.message;

        res.status(err.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    } else {
        err.statusCode = err.statusCode || 500;

        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });
    }
}