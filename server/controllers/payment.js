'use strict'

const mongoose = require('mongoose');
const Refund = mongoose.model('Refund');

var gateway;

var sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

exports.init = function () {
  gateway = require('../../lib/gateway');
};

exports.create = function (req, res) {

  console.log(req.body);
  let payment = {
    amount: req.body.total,
    descriptor: {
      name: 'company*my production',
      phone: '3125551212',
      url: 'company.com'
    },
    options: {
      submitForSettlement: true
    }
  };
  // console.log(payment);
  // console.log(req.body.method);
  let method = req.body.method;
  if (method == 'credit') {
    var name = req.body.fname + ' ' + req.body.lname;
    const creditCard = {
      cardholderName: name,
      number: req.body.cnum,
      expirationMonth: req.body.expmon,
      expirationYear: req.body.expyear,
      cvv: req.body.cvv2
    };
    payment.creditCard = creditCard;
    payment.paymentMethodNonce = 'fake-valid-nonce';
    console.log(payment);
  }
  gateway.transaction.sale(payment, function (err, result) {
    if (err){
      console.log('in error');
      console.log(result);
      sendJSONresponse(res, 400, {
        error: 'Invalid data'
      });
    }else {
      console.log(result);
      res.send(result);
    }
  });
};

exports.refundTransaction = function (req, res) {

  gateway.transaction.refund(req.body.paymentid, req.body.refundAmount, function (err, result) {
    if (err){
      console.log(err.type);
      console.log(err.name);
      console.log(err.message);
      sendJSONresponse(res, 400, {
        error: 'Some error'
      });
    }else {
      if (result.success){
        var refund = new Refund();
        var today = new Date();

        refund.paymentid = req.body.paymentid;
        refund.total = req.body.refundAmount;
        refund.date = today;
        refund.save(function (err) {
          if (err) {
            console.log('error while saving refund to db: ' + err);
          }
        });
      }
      res.send(result);
    }
  });
}
/*
exports.get = function (req, res) {
  console.log('gateway get');
  gateway.transaction.find(req.params.paymentid, function (err, result) {
    if (result.success) {
      res.send(result);
      console.log(err);
    } else {
      res.send(result);
    }
  });

};*/



