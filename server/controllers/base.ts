abstract class BaseCtrl {

  abstract model: any;


  // Get all
  getAll = (req, res) => {
    this.model.find({}, (err, docs) => {
      if (err) { return console.error(err); }
      res.json(docs);
    });
  };


  load = (req, res, next, id) =>
    this.model.findById(id)
      .then(m => req[this.model.collection.collectionName] = m)
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

  show = (req, res) => res.json(req[this.model.collection.collectionName]);

  // Count all
  count = (req, res) => {
    this.model.count((err, count) => {
      if (err) { return console.error(err); }
      console.log(`Count: ${count}`);
      res.json(count);
    });
  };

  // Insert
  insert = (req, res) => {
    const obj = new this.model(req.body);
    obj.save((err, item) => {
      // 11000 is the code for duplicate key error
      if (err && err.code === 11000) {
        res.sendStatus(400);
      }
      if (err) {
        return console.error(err);
      }
      res.status(200).json(item);
    });
  };

  // Get by id
  get = (req, res) => {
    this.model.findOne({ _id: req.params.id }, (err, obj) => {
      if (err) { return console.error(err); }
      res.json(obj);
    });
  };

  // Update by id
  update = (req, res) =>
    this.model.findOneAndUpdate({ _id: req[this.model.collection.collectionName]._id }, req.body, {new: true})
      .then(m => res.json(m))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: err});
      });

  // Delete by id
  delete = (req, res) => {
    this.model.findOneAndRemove({ _id: req[this.model.collection.collectionName]._id }, (err) => {
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  };
}

export default BaseCtrl;
