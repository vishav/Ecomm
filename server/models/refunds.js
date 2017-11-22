/**
 * Created by vishav on 11/15/2017.
 */

var mongoose = require('mongoose');

var refundSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentid: {
    type: String,
    required: true
  },
});

mongoose.model('Refund', refundSchema);

