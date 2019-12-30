"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _path = _interopRequireDefault(require("path"));

var _downloadGitRepo = _interopRequireDefault(require("download-git-repo"));

var _ora = _interopRequireDefault(require("ora"));

var _userHome = _interopRequireDefault(require("user-home"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _rimraf = require("rimraf");

var _fs = require("fs");

var _Generator = _interopRequireDefault(require("./Generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Creator =
/*#__PURE__*/
function () {
  /**
   * 创建项目的类
   * @param {String} projectName 项目名
   * @param {String} destDir 目标文件夹
   */
  function Creator(projectName, destDir) {
    _classCallCheck(this, Creator);

    this.projectName = projectName;
    this.destDir = destDir;
  }
  /**
   * 创建项目的入口
   * @param {Object} options 命令参数
   */


  _createClass(Creator, [{
    key: "create",
    value: function create(options) {
      var _this = this;

      this.confirmCreate() // 确认创建
      .then(function () {
        if (options.url) {
          return Promise.resolve({
            templatePath: options.url
          });
        }

        return _this.selectTemplate(); // 选择模板
      }).then(function (_ref) {
        var templatePath = _ref.templatePath,
            clone = _ref.clone;
        // templatePath: 模板的下载路径
        // clone: 是否使用git clone
        return _this.downloadTemplate(templatePath, options.clone || clone); // 下载模板
      }).then(function (tmpPath) {
        // tmpPath: 存放模板的本地路径
        // 生成项目
        return new _Generator["default"]().generate(_this.projectName, tmpPath, _this.destDir);
      }).then(function () {
        success('项目创建成功');
      })["catch"](function (err) {
        _this.exit(err);
      });
    }
    /**
     * 确定创建，防止误操作
     */

  }, {
    key: "confirmCreate",
    value: function confirmCreate() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (_this2.inCurrent || (0, _fs.existsSync)(_this2.destDir)) {
          _inquirer["default"].prompt([{
            type: 'confirm',
            message: _this2.inCurrent ? '在当前文件夹创建项目?' : '目标文件夹已存在, 是否覆盖并继续?',
            name: 'inCurrent'
          }]).then(function (answers) {
            if (answers.inCurrent) {
              resolve();
            }
          })["catch"](_this2.exit);
        } else {
          resolve();
        }
      });
    }
    /**
     * 选择模板
     */

  }, {
    key: "selectTemplate",
    value: function selectTemplate() {
      var _this$getTemplateData = this.getTemplateData(),
          templatePathMap = _this$getTemplateData.templatePathMap,
          templateList = _this$getTemplateData.templateList;

      return _inquirer["default"].prompt([{
        type: 'list',
        message: '请选择一种模板',
        name: 'template',
        "default": templateList[0],
        choices: templateList
      }]).then(function (_ref2) {
        var template = _ref2.template;
        var templatePath = templatePathMap[template];
        var clone = false; // 是否私有库

        var isPrivate = /^private:/.test(templatePath);

        if (isPrivate) {
          // 替换private为direct
          templatePath = templatePath.replace(/^private/, 'direct'); // 如果不是zip，则使用git clone

          if (!/zip$/.test(templatePath)) {
            clone = true;
          }
        }

        return {
          templatePath: templatePath,
          clone: clone
        };
      })["catch"](this.exit);
    }
    /**
     * 下载模板
     */

  }, {
    key: "downloadTemplate",
    value: function downloadTemplate(templatePath, clone) {
      var _this3 = this;

      var tmpPath = _path["default"].join(_userHome["default"], '.fet-template'); // 模板在本地存放的位置
      // 如果已经下载过，则将其删除【因为要更新】


      if ((0, _fs.existsSync)(tmpPath)) {
        (0, _rimraf.sync)(tmpPath);
      }

      return new Promise(function (resolve, reject) {
        var spinner = (0, _ora["default"])('模板下载中...');
        spinner.start();
        (0, _downloadGitRepo["default"])(templatePath, tmpPath, {
          clone: clone
        }, function (err) {
          spinner.stop();

          if (err) {
            _this3.exit(err);
          }

          resolve(tmpPath);
        });
      });
    }
    /**
    * 获取模版数据
    */

  }, {
    key: "getTemplateData",
    value: function getTemplateData() {
      var globalConfig = JSON.parse(fs.readFileSync(FET_RC, {
        encoding: 'utf8'
      }));
      var templatePathMap = {
        'spa': 'wsfe/fet-templates-vue',
        // 单页应用
        'mpa': 'wsfe/fet-templates-multi' // 多页应用

      };
      Object.keys(globalConfig).forEach(function (key) {
        if (globalConfig[key]) {
          var matchs = key.match(/^template-(.+)$/);

          if (matchs && matchs.length >= 2) {
            templatePathMap[matchs[1]] = globalConfig[key];
          }
        }
      });
      return {
        templatePathMap: templatePathMap,
        templateList: Object.keys(templatePathMap)
      };
    }
    /**
     * 错误退出
     */

  }, {
    key: "exit",
    value: function exit(err) {
      error(err);
      process.exit(1);
    }
  }]);

  return Creator;
}();

exports["default"] = Creator;