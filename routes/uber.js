var rp = require('request-promise');
var Promise = require('bluebird');

var uber_server_token = 'Nv9o4t8mrO5AqwSJVCaQgfZ_7jKpOPGdraIO3ix6';
var uber_x_product_id = "edb1dad4-0db1-4a50-9a23-b6ae9db375ad"; // should not use this product id, since different city has different
// product id

function defineUberRoute (router) {
	router.get('/estimate', getEstimate);
	router.post('/reminder', sendReminder);
}

function getEstimate(req, res, next){


	var timeEstimate = {
		start_latitude: req.query.start_latitude,
		start_longitude: req.query.start_longitude
		// product_id: uber_x_product_id
	}

	var priceEstimate = {
		start_latitude: req.query.start_latitude,
		start_longitude: req.query.start_longitude,
		end_latitude: req.query.end_latitude,
		end_longitude: req.query.end_longitude,
	}



	var optionsTimeEstimate = {
		uri: 'https://api.uber.com/v1/estimates/time',
		method: 'GET',
		headers: {
			Authorization: 'Token ' + uber_server_token
		},
		qs: timeEstimate
		
	}

	var optionsPriceEstimate = {
		uri: 'https://api.uber.com/v1/estimates/price',
		method: 'GET',
		headers: {
			Authorization: 'Token ' + uber_server_token
		},
		qs: priceEstimate	
	}

	// rp(optionsTimeEstimate)
	// 	.then(function(data){
	// 		var timeResult = JSON.parse(data);
	// 		console.log(data);
	// 		// res.json({time: timeResult.times[0].estimate, product: timeResult.times[0].display_name});
	// 		console.log(timeResult);
	// 		res.json(data);
	// 	})
	// 	.catch(function(e) {
	// 		res.json(e);
	// 	});

	
	Promise.all([rp(optionsTimeEstimate), rp(optionsPriceEstimate)])
		.then(function(results) {
			var resultJson = {code: 200, message: 'success', data: {display_name: 'uberX'}};
			//res.json(results[1]);
			var timeEstimates = JSON.parse(results[0]).times;
			var priceEstimates = JSON.parse(results[1]).prices;

			timeEstimates.forEach(function(estimate){
				if(estimate.display_name === 'uberX') {
					resultJson.data.estimate_time = estimate.estimate;
				}
			});

			priceEstimates.forEach(function(priceItem){
				if(priceItem.display_name === 'uberX') {
					resultJson.data.estimate_price = priceItem.estimate;
				}
			});
                // {code: 200, message: 'success', data: {display_name: 'uberX', estimate_time: 180, estimate_price: '4 - 5 dollars' }}
                // {code: 422, message: "Distance between two points exceeds 100 miles"}
			res.json(resultJson);
			

		})
		.catch(function (err) {
			// error code 4xx will end up here
			if(err.statusCode && err.statusCode === 422) {
				res.json({code: 422, message: JSON.parse(err.error).message  });
				return;
			}
			res.json(err);
		});
}

function sendReminder(req, res, next) {
	res.json('ok');
}

module.exports = {mountTo: defineUberRoute};
