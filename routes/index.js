var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/getData', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.jsonp({"name":"fang","age":"23","address":"china"});
});




module.exports = router;
