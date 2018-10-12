var express = require("express");
var app = express();
var FuzzySearch = require('fuzzy-search');
 
const people = [{
  name: {
    firstName: 'Jesse',
    lastName: 'Bowen',
  },
  state: 'Seattle',
}];
 
const searcher = new FuzzySearch(people, ['name.firstName', 'state'], {
  caseSensitive: true,
});
const result = searcher.search('ess');

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Library server has started");
})