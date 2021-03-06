"use strict";

var async = require('async');

var inquirer = require('inquirer'); // Support types from prompt-for which was used before


var promptMapping = {
  string: 'input',
  "boolean": 'confirm'
};
/**
 * Ask questions, return results.
 *
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */

module.exports = function ask(prompts, data, done) {
  async.eachSeries(Object.keys(prompts), function (key, next) {
    prompt(data, key, prompts[key], next);
  }, done);
};
/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */


function prompt(data, key, prompt, done) {
  var promptDefault = prompt["default"];

  if (typeof promptDefault === 'function') {
    promptDefault = function promptDefault() {
      return prompt["default"].bind(this)(data);
    };
  }

  inquirer.prompt([{
    type: promptMapping[prompt.type] || prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    "default": promptDefault,
    choices: prompt.choices || [],
    validate: prompt.validate || function () {
      return true;
    }
  }]).then(function (answers) {
    if (Array.isArray(answers[key])) {
      data[key] = {};
      answers[key].forEach(function (multiChoiceAnswer) {
        data[key][multiChoiceAnswer] = true;
      });
    } else if (typeof answers[key] === 'string') {
      data[key] = answers[key].replace(/"/g, '\\"');
    } else {
      data[key] = answers[key];
    }

    done();
  })["catch"](done);
}