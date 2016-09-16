var mysql = require('mysql'),
	async = require('async'),
	db_config = require('../system/db_config'),
	status = require('../system/sys_status');



//建立连接池1e
var pool = mysql.createPool(db_config);
//添加用户
exports.addPassport = function(account, password, email, res) {
	pool.getConnection(function(err, connection) {

		//按顺序执行多条任务，并且下一个任务可以获取上一个任务的结果
		var tasks = [function(callback) {
			connection.beginTransaction(function(err) {
				callback(err);
			})
		}, function(callback) {
			connection.query('SELECT * FROM sys_passport WHERE passport_acc = ?',
				account,
				function(err, result) {
					if (result.length != 0) {
						res.json({
							success: false,
							status: status.oprErr,
							msg: '账号已经存在!'
						})
						return;
					}
					callback(err)
				})
		}, function(callback) {
			connection.query('INSERT INTO sys_passport (passport_acc,passport_pwd,passport_email) values (?,?,?)', [account, password, email],
				function(err, result) {
					callback(err); // 生成的ID会传给下一个任务
				})
		}, function(callback) {
			connection.commit(function(err) {
				callback(err);
			});
		}];

		async.waterfall(tasks, function(err, results) {
			if (err) {
				res.json({
					success: false,
					status: status.sysErr,
					msg: status.msgSysErr
				})
				connection.rollback(); // 发生错误事务回滚
			} else {
				res.json({
					success: true,
					status: status.oprSuccess,
					msg: '注册成功！'
				})
			}
			connection.release()
		});
	})
}

//登录验证
exports.loginCheck = function(account, password, res) {
	pool.getConnection(function(err, connection) {

		var task = [function(callback) {
			connection.beginTransaction(function(err) {
				callback(err);
			})
		}, function(callback) {
			connection.query('SELECT * FROM sys_passport WHERE passport_acc = ? AND passport_pwd = ?', [account, password],
				function(err, result) {
					if (result.length == 0) {
						res.json({
							success: false,
							status: status.oprErr,
							msg: '账号或者密码错误'
						})
						return;
					} else {
						var jsonStr = JSON.stringify(result),
							passport_status = JSON.parse(jsonStr)[0].passport_status,
							passport_id = JSON.parse(jsonStr)[0].passport_id;

						if (passport_status == 1) {
							res.json({
								success: false,
								status: status.oprErr,
								msg: '账号已经登录!'
							})
							return;
						}
						callback(err, passport_id);
					}
				})
		}, function(passport_id, callback) {
			connection.query('UPDATE sys_passport SET passport_status = ? WHERE passport_id = ?', [1, passport_id],
				function(err, result) {
					if (result.affectedRows == 0) {
						res.json({
							success: false,
							status: status.oprErr,
							msg: status.msgOprErr
						})
					}
					callback(err);
				})
		}, function(callback) {
			connection.commit(function(err) {
				callback(err);
			});
		}]

		async.waterfall(task, function(err, results) {
			if (err) {
				res.json({
					success: false,
					status: status.sysErr,
					msg: status.msgSysErr
				});
				connection.rollback(); // 发生错误事务回滚
			} else {
				res.json({
					success: true,
					status: status.oprSuccess,
					msg: '登录成功！'
				})
			}
			connection.release();
		});
	});
}

//注销账号
exports.loginOut = function(account, res) {
	pool.getConnection(function(err, connection) {
		connection.query('UPDATE sys_passport SET passport_status = ? WHERE passport_acc = ?', [0, account],
			function(err, result) {
				if (result.affectedRows == 0) {
					res.json({
						success: false,
						status: status.oprErr,
						msg: status.msgOprErr
					})
					return;
				}else{
					res.json({
						success: true,
						status: status.oprSuccess,
						msg: status.msgOprSuccess
					})
				}
			})
	});
}