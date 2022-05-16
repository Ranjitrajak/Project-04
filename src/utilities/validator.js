const ObjectId = require("mongoose").Types.ObjectId


//**********************************************************************//

//==Request Body Validation
let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return false;
    return true;
}
//**********************************************************************//

//==Mandatory Field Validation
let isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}
//**********************************************************************//

//==ObjectId Validation
let isValidObjectId = function (objectId) {
    if (!ObjectId.isValid(objectId)) return false;
    return true;
}
//**********************************************************************//

//==Email Validation
let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}
//**********************************************************************//

//==Mobile Number Validation
let isValidMobile = function (number) {
    let mobileRegex = /^\d{10}$/;
    return mobileRegex.test(number);
}
//**********************************************************************//

//==Name Validation
let isValidName=function(name){
let nameRegex=/^[A-Za-z\s]{1,}[A-Za-z\s]{0,}$/;
return nameRegex.test(name);
}
//**********************************************************************//

//==Password Validation
let isValidPassword=function(password){
    let regexPassword=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
    return regexPassword.test(password);
}
//**********************************************************************//

//==Enum Validation
let isValidEnum= function(value){
    let title=["Mr", "Mrs","Miss"];
  return  title.indexOf(value) !== -1;
}
//**********************************************************************//

//==ISBN Validation
let isValidISBN=function(value){
    let isbnRegex=/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
    return isbnRegex.test(value);
} //(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)
//**********************************************************************//

//==Date Validation
let isValidDate = function(value) {
    let regEx = /^\d{4}-\d{2}-\d{2}$/;
    return regEx.test(value);
  }
//**********************************************************************//

module.exports = { isValidRequestBody,isValidDate,isValidISBN, isValid, isValidObjectId, isValidEmail, isValidMobile, isValidName, isValidPassword, isValidEnum }

//**********************************************************************//