var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var jwt = require('jsonwebtoken');
var user_1 = require('../models/user');
var base_1 = require('./base');
var UserCtrl = (function (_super) {
    __extends(UserCtrl, _super);
    function UserCtrl() {
        var _this = this;
        _super.apply(this, arguments);
        this.model = user_1["default"];
        this.login = function (req, res) {
            _this.model.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    return res.sendStatus(403);
                }
                user.comparePassword(req.body.password, function (error, isMatch) {
                    if (!isMatch) {
                        return res.sendStatus(403);
                    }
                    var token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
                    res.status(200).json({ token: token });
                });
            });
        };
        this.insert = function (req, res) {
            try {
                req.body.role = 'user';
                req.body.provider = 'local';
                _super.prototype.insert.call(_this, req, res);
            }
            catch (err) {
                res.status(400).json(err);
            }
        };
    }
    return UserCtrl;
})(base_1["default"]);
exports["default"] = UserCtrl;
