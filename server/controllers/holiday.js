var mongoose = require('mongoose');
var User = mongoose.model('User');
const request = require('request');
var Order = mongoose.model('Order');

const baseURL = 'http://www.worldholidaysandevents.com/HolidaysRESTJSON/webresources/holidaysandevents';
const holidaysUrl = baseURL+'/holidaysAndEvents/';

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.findfreeholidays = function (req, res) {
  if(req.params.toyear <= new Date().getFullYear()){
    request.get(
      { url: holidaysUrl+ req.params.country+'/'+req.params.state+'/'+req.params.city+'/'+req.params.fromyear+'/'+req.params.frommonth+'/'+req.params.fromday+'/'+req.params.toyear+'/'+req.params.tomonth+'/'+req.params.today,
        method:'Get'
      },
      function (error, apires, body) {
        if (error) {
          res.status(500).send(error);
          return;
        }

        if (apires.statusCode != 200 ) {
          res.status(apires.statusCode).send(apires.statusCode);
          return;
        }

        res.status(200).send(body);
      }
    );
  } else {
    console.log('throw error');
    res.status(401).send({'errormessage': 'Invalid Dates'})
  }

};

module.exports.findHolidays = function(req,res){
  console.log("find holidays called");
  var country = req.params.country;
  var state = (req.params.state == 'none')?'State': req.params.state ;
  var city = (req.params.city == 'none')?'City': req.params.city ;
  var toyear = req.params.toyear;
  var tomonth = req.params.tomonth;
  var today = req.params.today;
  var fromyear =req.params.fromyear;
  var frommonth = req.params.frommonth;
  var fromday = req.params.fromday;

  var data = {
    'country':country,
    'state':state,
    'city':city,
    'toYear':toyear,
    'toMonth':tomonth,
    'toDay':today,
    'fromYear':fromyear,
    'fromMonth':frommonth,
    'fromDay':fromday
  };
  Order.find({useremail:req.payload.email}).
    where('cartItems').elemMatch(data).
    exec(function (error, result) {
      if(error)
        console.log(error);
      if(!result)
        console.log("empty");
      else{
        for(var i = 0; i< result.length; i++){
          console.log(result[i]);
        }
        if(result.length > 0){
          getAuthor(req,res, function(req,res, userName){
            request.get(
              { url: holidaysUrl+ req.params.country+'/'+req.params.state+'/'+req.params.city+'/'+req.params.fromyear+'/'+req.params.frommonth+'/'+req.params.fromday+'/'+req.params.toyear+'/'+req.params.tomonth+'/'+req.params.today,
                method:'Get'
              },
              function (error, apires, body) {
                if (error) {
                  res.status(500).send(error);
                  return;
                }

                if (apires.statusCode != 200 ) {
                  res.status(apires.statusCode).send(apires.statusCode);
                  return;
                }

                res.status(200).send(body);
              }
            );
          });
        } else {
          sendJSONresponse(res,404, {"message" : "User not authorized"});
        }
      }
    });
};

var getAuthor = function(req, res, callback) {
  console.log("Finding author with email " + req.payload.email);
  if (req.payload.email) {
    User
      .findOne({ email : req.payload.email })
      .exec(function(err, user) {
        if (!user) {
          console.log("user not found");
          sendJSONresponse(res, 404, {
            "message": "User not found"
          });
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        console.log(user);
        callback(req, res, user.email);
      });

  } else {
    sendJSONresponse(res, 404, {
      "message": "User not found"
    });
    return;
  }

};
