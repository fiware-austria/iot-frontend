abstract class BaseCtrl {

  abstract model: any;
  abstract projection: string;


  // Get all
  getAll = (req, res) => {
    this.model.find({}, (err, docs) => {
      if (err) { return console.error(err); }
      res.json(docs);
    });
  };

  getList = (req, res) =>
    this.model.find({}, this.projection)
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));

  load = (req, res, next, id) =>
    this.model.findById(id)
      .then(m => req[this.model.collection.collectionName] = m)
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

  show = (req, res) => res.json(req[this.model.collection.collectionName]);

  // Count all
  count = (req, res) => {
    this.model.count().then(count => res.json(count)
      .catch(err => res.status(500).json({message: err})));
  };

  // Insert
  insert = (req, res) => {
    const obj = new this.model(req.body);
    obj.save().then(m => res.json(m))
      .catch(err => res.status(err.code === 11000 ? 400 : 500).json({message: err}));
  };

  // Get by id
  get = (req, res) => {
    this.model.findOne({ _id: req.params.id })
      .then(res.json)
      .catch(err => res.status(500).json({message: err}));
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
