if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}


console.log(process.env.SECRET);

const express = require("express");
const app =express();

const port =8080;

const mongoose = require('mongoose');
//---------------------------------------//
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");




//-----------------------------------------------//


//joi
const dbUrl=process.env.ATLASDB_URL;
//const Mongo_url="mongodb://127.0.0.1:27017/listening"


main().then((res)=>{
    console.log("connection succesfully");
}).
catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);

  
}

//ejs
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);

const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

// sign and local-------------------------------------//
const passport = require("passport");
const LocalStarategy = require("passport-local");
const User = require("./models/user.js");
//-------------------------------------//





// schema models
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const methodOverride=require("method-override");
app.use(methodOverride("_method"));


// public folder use
app.use(express.static(path.join(__dirname,"/public")));

//Async function use for error handling
const wrapAsync = require("./utils/wrapAsync.js");
// alag alag error show karna h
const ExpressError= require("./utils/ExpressError.js");

//require routes
const listing =require("./routes/listing.js");
const Reviewss=require("./routes/review.js");
const userRouter=require("./routes/user.js");



//--------------session----------//


const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600
});
store.on("error",()=>{
  console.log("error is mongo session store",err);
})

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,

  }
};



// app.get("/",(req,res)=>{
//   res.send("HI i am a big don");
// })



app.use(session(sessionOptions));
app.use(flash());



//paasport use middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStarategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.listen(port,()=>{
    console.log("server is running");
})

// flash middleware

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})



// app.get("/testing",(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"goa",
//         country:"India",
//     });
//     sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesfull testing");
   
// })


// demo for user use in paasport
/*
app.get("/demouser",async(req,res)=>{
  let fakeUser = new User({
    email:"singhajay96910@gmail.com",
    username:"kunwar singh"
  });
let registeruser = await User.register(fakeUser,"helloworld");
res.send(registeruser);

})*/


//use route folder it new express roter express

app.use("/listing",listing);

app.use("/listing/:id/reviews",Reviewss);

app.use("/",userRouter);



app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"page Not Found!...."));
})

app.use((err,req,res,next)=>{
  let{statusCode=500,message="something went wrong!"}=err;
  //res.status(statusCode).send(message);
 // res.send("Something went wrong!");
 res.status(statusCode).render("error.ejs",{message});
})





