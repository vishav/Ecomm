var mongoose = require('mongoose');
const request = require('request');
var Order = mongoose.model('Order');
var User = mongoose.model('User');

const baseURL = 'http://www.worldholidaysandevents.com/HolidaysRESTJSON/webresources/holidaysandevents';
const holidaysUrl = baseURL + '/holidaysAndEvents/';

var sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.getTransactions = async function (req, res) {
  var country = req.params.country;
  var state = (req.params.state === 'none') ? 'State' : req.params.state;
  var city = (req.params.city === 'none') ? 'City' : req.params.city;
  var fname = null;
  var lname = null;
  var email = null;
  var model = JSON.parse(req.params.model);
  if (model !== {}) {
    fname = model.fname;
    lname = model.lname;
    email = model.useremail;
  }
  var fromDate = req.params.fromDate;
  var toDate = req.params.toDate;

  var data = {};
  if (country !== 'Country') {
    data.country = country;
  }
  if (state !== 'State') {
    data.state = state;
  }
  if (city !== 'City') {
    data.city = city;
  }

  var userparameters = {};
  if (fname) {
    userparameters.fname = { $regex : new RegExp(fname, 'i') } ;
  }
  if (lname) {
    userparameters.lname = { $regex : new RegExp(lname, 'i') } ;
  }

  var orderparameters = {};
  if (email) {
    orderparameters.useremail = { $regex : new RegExp(email, 'i') } ;
  }

  var useremaillist = [];
  if (fname || lname) {
    var users = await User.find(userparameters).select('fname lname email').exec(function (error, result) {
      for (var i = 0; i < result.length; i++) {
        useremaillist.push(result[i].email);
      }
    });
    orderparameters.useremail = { $in: useremaillist };
  }

  var details;
  var query = Order.find(orderparameters).where('date').gt(fromDate).lt(toDate).where('cartItems').elemMatch(data).select('date total useremail cartItems').sort({ date: -1 });
  await query.lean().exec(function (error, result) {
    details = result;
    if (error) {
      sendJSONresponse(res, 404, error);
    } else if (!result || result.length === 0) {
      sendJSONresponse(res, 200, []);
    }
  });
  var det = [];
  for (var i = 0; i < details.length; i++){
    if (userparameters !== {}) {
      var detailsquery = User.findOne({ email: details[i].useremail }).select('fname lname');
      await detailsquery.exec(function (error, name) {
        if (name) {
          fname = name.fname;
          lname = name.lname;
        }
      });
    }
    det.push({ fname:fname,lname:lname,date:details[i].date,useremail:details[i].useremail,cartItems:details[i].cartItems, total:details[i].total });
    fname = null;
    lname = null;
  }
  sendJSONresponse(res, 200, det);
};

/*module.exports.downloadTransactions = function (req, res) {
  // Require library
  var excel = require('excel4node');

  // Create a new instance of a Workbook class
  var workbook = new excel.Workbook();

  // Add Worksheets to the workbook
  var worksheet = workbook.addWorksheet('Order');

  var query = Order.find(orderparameters).where('date').gt(fromDate).lt(toDate).where('cartItems').elemMatch(data).select('date total useremail cartItems').sort({ date: -1 });
  var orders = query.exec(function (error, result) {
    if (error) {
      sendJSONresponse(res, 404, error);
    } else if (!result || result.length === 0) {
      sendJSONresponse(res, 200, []);
    } else if (result.length > 0) {
      sendJSONresponse(res, 200, result);
    }
  });
};*/
