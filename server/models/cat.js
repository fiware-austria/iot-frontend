var mongoose = require('mongoose');
var catSchema = new mongoose.Schema({
    name: String,
    weight: Number,
    age: Number
});
var Cat = mongoose.model('Cat', catSchema);
exports["default"] = Cat;
