/*
	账户管理
	登录、注册
*/
var express = require('express'),
	dbServer = require('../server/db.js'),
	router = express.Router();


router.post('/register', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	if (req.body) {
		var account = req.body.account,
			password = req.body.password,
			email = req.body.email;

		//数据库操作
		dbServer.addPassport(account,password,email,res);
	} else {
		res.json({
			success: false,
			message: '操作失败!'
		});
	}
})

router.post('/login',function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	if (req.body) {
		var account = req.body.account,
			password = req.body.password;

		//数据库操作
		dbServer.loginCheck(account,password,res);
	} else {
		res.json({
			success: false,
			message: '操作失败!'
		});
	}
})

module.exports = router;