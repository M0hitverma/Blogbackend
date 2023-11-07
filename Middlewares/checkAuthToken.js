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


  
        req.userId=decoded.userId;
        next();
       
      
  })
}
module.exports=checkAuth;
