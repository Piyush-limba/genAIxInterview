const express=require('express');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const app=express();

//basic middlewares and configurations
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
//require all Routes here
const authRouter=require('./routes/auth.routes.js');
const interviewRouter=require('./routes/interview.routes.js');
//using all routes here
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);

module.exports=app;