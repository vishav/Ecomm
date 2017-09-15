var mongoose = require('mongoose');
const request = require('request');
var Order = mongoose.model('Order');

const baseURL = 'http://www.worldholidaysandevents.com/HolidaysRESTJSON/webresources/holidaysandevents';
const holidaysUrl = baseURL + '/holidaysAndEvents/';

var sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.getTransactions = function (req, res) {
  var email = req.payload.email;
  var country = req.params.country;
  var state = (req.params.state == 'none') ? 'State' : req.params.state;
  var city = (req.params.city == 'none') ? 'City' : req.params.city;
  var toyear = req.params.toyear;
  var tomonth = req.params.tomonth;
  var today = req.params.today;
  var fromyear = req.params.fromyear;
  var frommonth = req.params.frommonth;
  var fromday = req.params.fromday;
  var fromDate = req.params.fromDate;
  var toDate = req.params.toDate;

  var data = {
    /*    country: country,
        state: state,
        city: city,
        toYear: toyear,
        toMonth: tomonth,
        toDay: today,
        fromYear: fromyear,
        fromMonth: frommonth,
        fromDay: fromday*/
  };
  if (country !== 'Country'){
    data.country = country;
  }
  if (state !== 'State'){
    data.state = state;
  }
  if (city !== 'City'){
    data.city = city;
  }
  var parameters = {};
  /*  if (email) {
      parameters.useremail = email;
    }*/
  console.log('todate:', toDate, 'fromDate:', fromDate);
  // var queryresult = Order.find(query).where('cartItems').elemMatch(data).where('date').gt(fromDate).lt(toDate).exec(function(error, result)
  var query = Order.find(parameters).where('date').gt(fromDate).lt(toDate).where('cartItems').elemMatch(data).select('date total useremail cartItems').sort({ date:-1 });

  query.exec(function (error, result) {
    console.log('queryresult:', result);
    if (error) {
      sendJSONresponse(res, 404, error);
    }else if (!result){
      sendJSONresponse(res, 200, []);
    }else if (result.length > 0) {
      sendJSONresponse(res, 200, result);
    }
  });
}

