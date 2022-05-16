
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel");
const { isValidRequestBody, isValid, isValidEnum, isValidName, isValidMobile, isValidEmail, isValidPassword } = require("../utilities/validator");


//---REGISTER USER
const registerUser = async function (req, res) {
    try {
//==validating request body==//
        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "Invalid request, please provide details" })
        let { title, name, phone, email, password,address } = requestBody
           
//==validating title==//
        if (!isValid(title)) return res.status(400).send({ status: false, msg: "Title is a mendatory field" })
        if (!isValidEnum(title)) return res.status(400).send({ status: false, msg: "Title must contain Mr, Mrs, Miss" })

//==validating name==//
        if (!isValid(name)) return res.status(400).send({ status: false, msg: "Name is a mendatory field" })
        if (!isValidName(name)) return res.status(400).send({ status: false, msg: "Name must contain only alphabates" })

//==validating phone==//        
        if (!isValid(phone)) return res.status(400).send({ status: false, msg: "Phone number is a mendatory field" })
        if (!isValidMobile(phone)) return res.status(400).send({ status: false, msg: `${phone} number is not a valid` })
        let isUniquePhone = await userModel.findOne({ phone: phone })
        if (isUniquePhone) return res.status(400).send({ status: false, msg: `${phone} number is already exist` })

//==validating email==//
        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is a mendatory field" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, msg: `${email} is not valid` })
        let isUniqueEmail = await userModel.findOne({ email: email })
        if (isUniqueEmail) return res.status(400).send({ status: false, msg: `${email} is already exist` })

//==validating password==//
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "Password is a mendatory field" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, msg: `Password ${password}  must include atleast one special character[@$!%?&], one uppercase, one lowercase, one number and should be mimimum 8 to 15 characters long` })

//==creating user without address==//
        if(!address){
        const userData2 = { title, name, phone, email, password };
        const saveUser = await userModel.create( userData2)
        return res.status(201).send({ status: true, message: "Sucess", data: saveUser })
        }

//==creating user with address==//
        const userData = { title, name, phone, email, password, address };
        const saveUser = await userModel.create( userData)
        return res.status(201).send({ status: true, message: "Success", data: saveUser })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


//**********************************************************************//


//---User LOGIN
const loginUser = async function (req, res) {
    try {
//==validating request body==//
        let requestBody = req.body;
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "Invalid request, please provide details" })
        const { email, password } = requestBody

//==validating email==//
        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is a mendatory field" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, msg: `${email} is not valid` })
        
//==validating password==//
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "Password is a mendatory field" })

//==finding userDocument==//
        let isUserEmailExist = await userModel.findOne({ email: email,password: password });
        if (!isUserEmailExist) return res.status(404).send({ status: false, msg: "Email or Password is incorrect!" })
        const { _id } = isUserEmailExist;

//==creating token==//
        let token = jwt.sign(
            {
                userId: _id.toString(),
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
            },
            "Dksfoljdc45095"
        );
        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, message: "Success", data: { token: token } });
    }
    catch (err) {
        res.status(500).send({ status:false, error: err.message });
    }
};

//**********************************************************************//

module.exports = { registerUser, loginUser }

//**********************************************************************//