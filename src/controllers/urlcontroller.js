const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require("redis");
const urlModel = require("../models/Urlmodel")
const { promisify } = require("util");

//Connect to redis-------

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

//Connection setup for redis------

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);

const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//start create short url------

const createShorturl = async function (req, res) {
  try {

    let { longUrl } = req.body

    if (Object.keys(req.body).length == 0) { return res.status(400).send({ message: "please input data" }) }


    //validation of long url------


    if (!validUrl.isWebUri(longUrl)) {
      
      return res.status(400).json('Invalid base URL')
    }

    //Finding long url in cache----

    let alreadyCreate = await GET_ASYNC(`${longUrl}`)

    let jsonData = JSON.parse(alreadyCreate)

    if (alreadyCreate) {
      return res.status(201).send({ status: true, message: "succesfull", data: jsonData })
    }

    //create short url-------    


    else {
      const baseUrl = ' http://localhost:3000'
      const urlCode = shortid.generate().toLowerCase()
      const shortUrl = baseUrl + '/' + urlCode
      const newUrl = { longUrl, shortUrl, urlCode }
      const short = await urlModel.create(newUrl)


      //save short url in casche----

      await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(short))


      return res.status(201).send({ status: true, data: short })
    }
  }catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  } 

}
//Redirect short url to long url-------



const getlongurl = async function (req, res) {
  try {

    let urlCode = req.params.urlCode

    //urlcode validation........

   
    if (!shortid.isValid(urlCode)) return res.status(400).send({ status: false, message: "Please provide Correct urlCode." });

    // Find urlcode  in cache----

    let Url = await GET_ASYNC(`${urlCode}`)

    // console.log(Url)
    if (Url) {
      return res.status(302).redirect(Url)
    }

    //Find urlcode in Database----

    let url = await urlModel.findOne({ urlCode: urlCode })

    if (!url){

      return res.status(404).send({ status: false, message: "URL not found !" });}

    //save urlcode in cache-----

    await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(url.longUrl))

    //redirect to long url-----

    return res.status(302).redirect(url.longUrl)

  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }


}

module.exports = { createShorturl, getlongurl }
