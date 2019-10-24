"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = {
  md5: function md5(content) {
    return _crypto["default"].createHash('md5').update(content).digest('hex');
  }
};
exports["default"] = _default;