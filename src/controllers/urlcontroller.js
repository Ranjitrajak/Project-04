const urlModel=require("../models/Urlmodel")
const validUrl = require('valid-url')
const shortid = require('shortid')
const baseUrl = 'http:localhost:3000'

const createShorturl= async function(req,res){
    const {longUrl}=req.body
    if (!validUrl.isUri(longUrl)) { return res.status(400).send({msg:"invalid url"})}
    const urlCode = shortid.generate()
    const shortUrl = baseUrl + '/' + urlCode
    const newurl={longUrl,urlCode,shortUrl}
    const short= await urlModel.create(newurl)
    return res.status(201).send({data:short})

}
const getlongurl=async function(req,res){
    urlCode= req.params.urlCode
    const url = await urlModel.findOne({urlCode})
   
    if (url) {
        // when valid we perform a redirect
        return res.status(200).send({satue:true,data:url.longUrl})
    } else {
        // else return a not found 404 status
        return res.status(404).send('No URL Found')
    }
}
module.exports.createShorturl=createShorturl
module.exports.getlongurl=getlongurl