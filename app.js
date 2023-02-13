// set up
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
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

// serve static assets from the 'public' directory
app.use(express.static('public'))

// serve HTML homepage
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve redirect according to user input
app.get("/api/shorturl/:number", function(req, res) {
    WebAddress.find({ shortUrl: req.params.number}, (err, result) => {
      if (result.length > 0) {
        res.redirect('http://' + result[0].url);
      } else {
        res.sendFile(process.cwd() + '/views/index.html');
      }
    })
  });

// listen on port 3000 for requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})