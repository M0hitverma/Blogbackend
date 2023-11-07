const jwt= require('jsonwebtoken');

function checkAuth(req,res,next){

     const authToken=req.cookies.authToken;
     const refreshToken =req.cookies.refreshToken;

     console.log("Check Auth Token Middle Wear Called");

     if(!authToken || !refreshToken){
       return res.status(401).json({
            message: "Authentication Failed: No  authToken or RefreshToken is provided",
        })
     }


  jwt.verify(authToken,process.env.JMT_SECRET_KEY,(err,decoded)=>{


       if(err){
          jwt.verify(refreshToken,process.env.JMT_REFRESH_SECRET_KEY,(refreshErr,refreshDecoded)=>{
            if(refreshErr){
                return res.status(401).json({
                    message: "Authentication Failed: Both tokens are invalid",
                    ok: false
                });
            }
            else{
                const newAuthToken = jwt.sign({userId: refreshDecoded.userId},process.env.JMT_SECRET_KEY,{expiresIn:'20m'});
                const newRefreshToken=jwt.sign({userId: refreshDecoded.userId},process.env.JMT_REFRESH_SECRET_KEY,{
                    expiresIn:'40m'});

                res.cookie('authToken',newAuthToken,{ httpOnly: true});
                res.cookie('refreshToken',newRefreshToken,{httpOnly: true});
                req.userId= refreshDecoded.userId;
                next();
               }

          })
        
       }
       else{
        req.userId=decoded.userId;
        next();
       }
      
  })
}
module.exports=checkAuth;
