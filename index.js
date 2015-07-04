/* @flow */

var fs = require("fs")
var jade = require("jade")
var is = require("is_js")
var express = require("express")
var async = require('async')
var request = require('request')
var CronJob = require('cron').CronJob

module.exports = function() {
	var app = express()

	app.locals.title = "StackExchange"

	app.locals.configId = function(){
		if (app.locals.user) {
			return app.locals.user.display_name
		}
		return app.locals.config.user_id.value
	}

	app.locals.config = {
		user_id: {
			label: 'User ID',
			value: null,
			setValue: function(v){
				this.value = v
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				if (is.not.number(parseInt(value))){
					return "value must be a number"
				}
				else {
					return null
				}
			}
		},
		site: {
			label: 'Sitename',
			value: 'stackoverflow',
			setValue: function(v){
				this.value = v
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				return null
			}
		}
	}

	var render = jade.compileFile(__dirname + "/views/index.jade")
	var renderLoading = jade.compileFile(__dirname + "/views/loading.jade")

	app.html = function() {
		if (app.locals.user != null) {
			return render(app.locals)
		} else {
			return renderLoading(app.locals)
		}
	}
	app.less = function() {
		return fs.readFileSync(__dirname + "/stylesheets/style.less").toString()
	}
	app.use("/public", express.static(__dirname + "/public", {
		maxAge: "7d"
	}))

	app.generate = function() {
		if (!is.string(app.locals.config.user_id.value)) {
			  // app.locals.user_id is invalid.
			return
		}
		if (!is.string(app.locals.config.site.value)) {
			  // app.locals.site is invalid.
			return
		}

		async.parallel(
			{
				users: function(callback) {
					var url = 'http://api.stackexchange.com/2.2/users/' + app.locals.config.user_id.value + '?order=desc&sort=reputation&site=' + app.locals.config.site.value
					get(url, function(body) {
						callback(null, JSON.parse(body))
					})
				},
			},
			function(err, results) {
				if (err != null) {
					console.log("err: " + err)
					return
				}

				app.locals.user = results.users.items[0]
			}
		)
	}

	function get(url, callback) {
		// Set the headers
		var headers = {
			'User-Agent': 'Erdblock/0.1',
			'Content-Type': 'text/html',
			'charset': 'utf-8',
		}
		// Configure the request
		var options = {
			url: url,
			method: 'GET',
			headers: headers,
			gzip: true,
		}

		request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(body)
			}
		})
	}

	new CronJob('0 31 * * * *',
		app.generate,
		null,
		true
	)

	return app
}
