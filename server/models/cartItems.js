var mongoose = require('mongoose');

var cartItemSchema = new mongoose.Schema({
  country: String,
  state: String,
  city: String,
  fromYear: Number,
  fromMonth: Number,
  fromDay: Number,
  toYear: Number,
  toMonth: Number,
  toDay: Number
});

var shoppingCartSchema = new mongoose.Schema({
  useremail: {
    type: String,
    unique: true,
    required: true
  },
  cartItems: [cartItemSchema]
});


mongoose.model('ShoppingCart', shoppingCartSchema);

