// set up
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const dns = require('dns')
const port = 3000

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create an address model
const Schema = mongoose.Schema;
const webAddressSchema = new Schema({
  url: String,
  shortUrl: Number
});
const WebAddress = mongoose.model('WebAddress', webAddressSchema);

// Mount the body-parser
app.use(bodyParser.urlencoded({extended: false}));

// serve static assets from the 'public' directory
app.use(express.static('public'))

// serve HTML homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve redirect according to user input
app.get("/api/shorturl/:number", function (req, res) {
  WebAddress.find({ shortUrl: req.params.number }, (err, result) => {
    if (result.length > 0) {
      res.redirect('http://' + result[0].url);
    } else {
      res.sendFile(process.cwd() + '/views/index.html');
    }
  })
});

// Get url from POST
app.post("/api/shorturl/new", function (req, res) {

  // Make url variable from req.body.url to simplify things later
  var url = req.body.url;

  // Remove http:// or https://, if present
  if (url.indexOf(":") > -1) {
    url = url.slice(url.indexOf(":") + 3);
  }

  // Check if url is valid
  dns.lookup(url, (err, address) => {
    if (err) {
      res.json({ "error": "invalid URL" }); // if not respond with json message
      // otherwise, search the database for the submitted url
    } else {
      WebAddress.find({ url: url }, (err, result) => {
        // if it's present in the database
        if (result.length > 0) {
          res.json({ "original_url": result[0].url, "short_url": result[0].shortUrl }); // respond with the existing short url
          // otherwise, create a new entry in the database
        } else {
          // count how many documents there are in order to create short url
          WebAddress.countDocuments({}, (err, count) => {
            // create new address and write it to the database
            var newAddress = new WebAddress({ url: url, shortUrl: count + 1 });
            newAddress.save(function (err, test) {
              if (err) return console.error(err);
            });
            res.json({ "original_url": url, "short_url": count + 1 }); // respond with the new short url
          });
        }
      });
    }
  })
})

// listen on port 3000 for requests
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})