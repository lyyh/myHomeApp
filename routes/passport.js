var express = require('express');
var router = express.Router();

router.use('/register',function(req,res,next){
	if(req.body){

	}
	res.json({'name':'liu'});
})

module.exports = router;