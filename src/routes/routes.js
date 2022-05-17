const express = require('express');

const router = express.Router();
const urlController=require("../controllers/urlcontroller")
router.post("/url/shorten",urlController.createShorturl)
router.get("/:urlCode",urlController.getlongurl)



module.exports = router;

//*******************************************************************//