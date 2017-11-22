"use strict"

const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const User = mongoose.model('User');
const Refund = mongoose.model('Refund');

let sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

let getTransactions = function(req, res) {
  console.log("gettransactions called");

  let transactiondetails = null;

  transactiondetails = getTransactionDetails(req);
  transactiondetails.then(function(value) {
    if (value.iserror) {
      sendJSONresponse(res, 404, value.errordetails);
    } else if (!value.results || value.results.length === 0) {
      sendJSONresponse(res, 200, []);
    } else {
      sendJSONresponse(res, 200, value.results);
    }
  });
};

let downloadTransactions = function(req, res) {

  console.log("downloadtransactions called");
  let transactiondetails = null;
  transactiondetails = getTransactionDetails(req);

  transactiondetails.then(function(value) {
    if (value.iserror) {
      sendJSONresponse(res, 404, value.errordetails);
    } else if (!value.results || value.results.length === 0) {
      sendJSONresponse(res, 200, []);
    } else {
      let results = value.results;

      // Require library
      let excel = require('excel4node');

      // Create a new instance of a Workbook class
      let wb = new excel.Workbook();

      const filename = 'Details' + '.xlsx';

      console.log("file generation started");

      const options = {
        sheetFormat: {
          defaultColWidth: 20,
        }
      }

      // Add Worksheets to the workbook
      let ws = wb.addWorksheet('Details', options);

      const mystyle = wb.createStyle({
        alignment: {
          wrapText: true,
        }
      });

      const headerstyle = wb.createStyle({
        font: {
          bold: true,
        }
      });

      let row = 1;
      let column = 1;

      ws.cell(row, column).string('Transaction Date').style(headerstyle);
      column++;
      ws.cell(row, column).string('Name').style(headerstyle);
      column++;
      ws.cell(row, column).string('Email').style(headerstyle);
      column++;
      ws.cell(row, column).string('Total').style(headerstyle);

      row++;

      for (let i = 0; i < results.length; i++) {
        const name = results[i].fname + " " + results[i].lname;
        row++;
        column = 1;
        ws.cell(row, column).date(results[i].date);
        column++;
        ws.cell(row, column).string(name);
        column++;
        ws.cell(row, column).string(results[i].useremail);
        column++;
        ws.cell(row, column).number(results[i].total);

        for (let j = 0; j < results[i].cartItems.length; j++) {
          column++;
          ws.cell(1, column).string('Item-' + (j + 1)).style(headerstyle);

          let orderdetails = "Country: " + results[i].cartItems[j].country;
          let range = "";

          let state = results[i].cartItems[j].state;
          let city = results[i].cartItems[j].city;

          if (state === "State") {
            state = 'No state Selected';
          }

          if (city === 'City') {
            city = 'No state Selected';
          }

          if (results[i].cartItems[j].fromMonth) {
            range += results[i].cartItems[j].fromMonth + "/";
          }

          if (results[i].cartItems[j].fromDay) {
            range += results[i].cartItems[j].fromDay + "/";
          }

          if (results[i].cartItems[j].fromYear) {
            range += results[i].cartItems[j].fromYear;
          }

          range += " - ";

          if (results[i].cartItems[j].toMonth) {
            range += results[i].cartItems[j].toMonth + "/";
          }

          if (results[i].cartItems[j].toDay) {
            range += results[i].cartItems[j].toDay + "/";
          }

          if (results[i].cartItems[j].toYear) {
            range += results[i].cartItems[j].toYear;
          }

          orderdetails += "\nState: " + state + "\nCity: " + city + "\nRange: " + range;

          ws.cell(row, column).string(orderdetails).style(mystyle);
        }
      }
      wb.write(filename, res);
      console.log("file generated");
    }
  });
};

let getTransactionDetails = async function(req) {

  let transactiondetails = {};
  console.log("gettransactiondetails called");
  let country = req.params.country;
  let state = (req.params.state === 'none') ? 'State' : req.params.state;
  let city = (req.params.city === 'none') ? 'City' : req.params.city;
  let fname = null;
  let lname = null;
  let email = null;
  let model = JSON.parse(req.params.model);
  if (model !== {}) {
    fname = model.fname;
    lname = model.lname;
    email = model.useremail;
  }
  let fromDate = null;
  let toDate = null;

  let data = {};
  if (country !== 'Country') {
    data.country = country;
  }
  if (state !== 'State') {
    data.state = state;
  }
  if (city !== 'City') {
    data.city = city;
  }

  if (req.params.fromDate && req.params.fromDate != "null") {
    fromDate = req.params.fromDate;
  }

  if (req.params.toDate && req.params.toDate != "null") {
    toDate = req.params.toDate;
  }

  let userparameters = {};
  if (fname) {
    fname = fname.trim();
    userparameters.fname = { $regex: new RegExp(fname, 'i') };
  }
  if (lname) {
    lname = lname.trim();
    userparameters.lname = { $regex: new RegExp(lname, 'i') };
  }

  let orderparameters = {};
  if (email) {
    email = email.trim();
    orderparameters.useremail = { $regex: new RegExp(email, 'i') };
  }

  let useremaillist = [];
  if (fname || lname) {
    await User.find(userparameters).select('fname lname email').exec(function(error, result) {
      for (let i = 0; i < result.length; i++) {
        useremaillist.push(result[i].email);
      }
    });
    orderparameters.useremail = { $in: useremaillist };
  }

  let details;
  let query = null;

  if (fromDate && toDate) {
    query = Order.find(orderparameters).where('date').gt(fromDate).lt(toDate).where('cartItems').elemMatch(data).select('date total useremail cartItems paymentid').sort({ date: -1 });
  } else {
    query = Order.find(orderparameters).where('date').where('cartItems').elemMatch(data).select('date total useremail cartItems paymentid').sort({ date: -1 });
  }

  await query.lean().exec(function(error, result) {
    details = result;
    if (error) {
      transactiondetails.iserror = true;
      transactiondetails.errordetails = error;
      return transactiondetails;
    } else if (!result || result.length === 0) {
      transactiondetails.results = [];
      return transactiondetails;
    }
  });

  if (transactiondetails.iserror || (transactiondetails.results && transactiondetails.results.length > 0 )) {
    console.log("returning", transactiondetails.iserror, transactiondetails.results);
    return transactiondetails;
  }

  let det = [];
  for (let i = 0; i < details.length; i++) {
    if (userparameters !== {}) {
      let detailsquery = User.findOne({ email: details[i].useremail }).select('fname lname');
      await detailsquery.exec(function(error, name) {
        if (name) {
          fname = name.fname;
          lname = name.lname;
        }
      });
    }
    let refunds = [];
    let refundsquery = Refund.find({ paymentid: details[i].paymentid }).select('date total paymentid');
    await refundsquery.exec(function(error, result) {
      refunds = result;
    });
    det.push({
      fname: fname,
      lname: lname,
      date: details[i].date,
      useremail: details[i].useremail,
      cartItems: details[i].cartItems,
      total: details[i].total,
      paymentid: details[i].paymentid,
      refunds: refunds
    });
    fname = "";
    lname = "";
  }
  transactiondetails.results = det;
  console.log("gettransactiondetails finished");

  return transactiondetails;
}


module.exports = {
  getTransactions: getTransactions,
  downloadTransactions: downloadTransactions
};
