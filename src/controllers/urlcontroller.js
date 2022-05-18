const urlModel=require("../models/Urlmodel")
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  13782,
  "redis-13782.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("I8LuoTIJ38lm0Oj9DqoRyNkGRd6YopnW", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});
//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//start create short url---

const createShorturl= async function(req,res){

    let {longUrl}=req.body
    if (!validUrl.isUri(longUrl)) {
        return res.status(400).json('Invalid base URL')
    }
    let alreadyCreate = await GET_ASYNC(`${longUrl}`)
    let jsonData=JSON.parse(alreadyCreate)
   //let check=await urlModel.findOne({longUrl:longUrl})
    if(alreadyCreate){
        return res.status(201).send({status:true,message:"succesfull",data:jsonData})
    }
    
    //let url=await urlModel.findOne({urlCode:urlCode})
    //if(url){
       //return res.status(409).send({status:false,message:"already exist"})
       
   // }
   else{
    const baseUrl = 'http:localhost:3000'
    const urlCode = shortid.generate().toLowerCase()
    const shortUrl = baseUrl + '/' + urlCode
    const newUrl={longUrl,shortUrl,urlCode}
    const short=await urlModel.create(newUrl)

    await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(short))
    

    return res.status(201).send({status:true,data:short})
}

}
const getlongurl=async function(req,res){
  
    let urlCode=req.params.urlCode

    if(!urlCode) return res.status(400).send({status : false, message : "Invalid request parameter. Please provide urlCode"})

    let Url = await GET_ASYNC(`${urlCode}`)
  
   //console.log(Url)
    if(Url){
       return res.status(302).redirect(Url) 
    }
   
        
    else{
        let url= await urlModel.findOne({urlCode:urlCode})
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(url.longUrl))
        return res.status(302).redirect(url.longUrl) 
    }
    

}

module.exports={createShorturl,getlongurl}