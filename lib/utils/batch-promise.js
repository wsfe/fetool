"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * 控制 Promise 并发数，在所有 Promise 都完成后才执行 resolve
 * @param {Function[]} fnArray 返回 Promise 的函数数组
 * @param {number} options.concurrent 同时进行的 Promise 数量上限
 * @param {boolean} options.rejectOnError 失败后立即执行 reject ，表现与 Promise.all 相同
 */
var batchPromise = function batchPromise(fnArray) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$concurrent = _ref.concurrent,
      concurrent = _ref$concurrent === void 0 ? Infinity : _ref$concurrent,
      _ref$rejectOnError = _ref.rejectOnError,
      rejectOnError = _ref$rejectOnError === void 0 ? false : _ref$rejectOnError;

  var i = 0;
  var pendingPromise = [];
  var returnValue = [];
  return new Promise(function (resolve, reject) {
    var execute = function execute() {
      if (i === fnArray.length) {
        if (!pendingPromise.length) resolve(returnValue);
        return;
      }

      var _loop = function _loop() {
        var currentIndex = i;
        var fn = fnArray[i++];

        if (typeof fn === 'function') {
          var p = fn();

          if (p instanceof Promise) {
            pendingPromise.push(p);
            p.then(function (value) {
              returnValue[currentIndex] = value;
            })["catch"](function (error) {
              returnValue[currentIndex] = error;
              if (rejectOnError) reject(error);
            }).then(function () {
              pendingPromise.splice(pendingPromise.indexOf(p), 1);

              if (i === fnArray.length) {
                if (!pendingPromise.length) resolve(returnValue);
              } else {
                execute();
              }
            });
          } else returnValue[currentIndex] = p;
        } else returnValue[currentIndex] = fn;
      };

      while (pendingPromise.length < concurrent && i !== fnArray.length) {
        _loop();
      }
    };

    execute();
  });
};

var _default = batchPromise;
exports["default"] = _default;