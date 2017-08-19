var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();
app.use(bodyParser.urlencoded({
  extended:true
}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

  next();
});

var mongoDB = 'mongodb://kieron:Kierkier1@ds139197.mlab.com:39197/kierondev';

var UserHoldings = new mongoose.Schema(
  { 
    currency: 'string', 
    holdings: 'number',
    rate: 'number',
    date:  'date'
  }
);


//Set up default mongoose connection  
mongoose.Promise = global.Promise;

var promise = mongoose.connect(mongoDB, {
  useMongoClient: true,
  /* other options */
});

app.post('/logUserHoldings', function (req, res) {
  var Holdings = mongoose.model('Holding', UserHoldings);

  Holdings.create(
    { 
      currency: req.body.currency, 
      holdings: req.body.holdings,
      rate: req.body.rate,
      date:  req.body.date    
    }, 
    function (err, Holdings) {
      if (err) return handleError(err);
      // saved!
      res.send(Holdings._id);
  });
});

app.post('/getUserHoldings', function (req, res) {
  var Holdings = mongoose.model('Holding', UserHoldings);

  Holdings.find({
    'currency': req.body.currency,
  }, function(err, holdings) {
    if(err) return (err);
    res.send(holdings);
  });
})

app.post('/getAllHoldings', function (req, res) {
  var Holdings = mongoose.model('Holding', UserHoldings);

  Holdings.find({
    'currency': req.body.currency,
  }, function(err, holdings) {
    if(err) return (err);
    var holdingsTotal = 0;
    var btcPrice = 0;
    var holdingsValues = {};

    holdings.map(function(holding) {
      console.log(holding);
      holdingsTotal += holding.holdings;
      btcPrice += holding.rate * holding.holdings;
    });
    holdingsValues['holdingsTotal'] = holdingsTotal;
    holdingsValues['netCostBtc'] = btcPrice;
    
    res.send(holdingsValues);
  });
})

app.post('/getNetCostBTC', function (req, res) {
  var Holdings = mongoose.model('Holding', UserHoldings);

  Holdings.find({
    'currency': req.body.currency,
  }, function(err, holdings) {
    if(err) return (err);
    var btcPrice = 0;

    holdings.map(function(holding) {
      btcPrice += holding.holdings * holding.rate;
    });
    
    res.send(btcPrice.toString());
  });
})

app.post('/deleteUserHolding', function (req, res) {
  var Holdings = mongoose.model('Holding', UserHoldings);

  Holdings.remove({_id: req.body._id}, function(err, holding) {
    if(err) return (err);
    res.send('Success');
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})