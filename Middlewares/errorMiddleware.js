function errorHandler(StatusCode, err,req,res,next){
    console.error(err.stack);

    if(res.headersSent){
        return next(err);
    }
    console.log("ERROR MIDDLEWARE CALLED")
    res.status(statusCode || 500).json({
        message:err.message,
        ok: false
    })
}

module.exports = errorHandler;