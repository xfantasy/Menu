define(function(require, exports, module) {

  var _ = require('underscore'),
    $ = require('$');

  var symbolMap = {
    'Ctrl': ['ctrl', 'command', 'cmd', '⌘'],
    'Alt': ['alt', 'option', 'opt', '⎇'],
    'Shift': ['shift', '⇧']
  };

  var symbolMapForMac = {
    '⌘': ['ctrl', 'command', 'cmd'],
    '⎇': ['option', 'opt', 'alt'],
    '⇧': ['shift'],
    '⇪': ['capslock'],
    '⇥': ['tab'],
    '⌃': ['control'],
    '↩': ['return', 'enter'],
    '⌫': ['delete', 'del'],
    '⏏': ['eject'],
    '↖': ['home'],
    '↘': ['end'],
    '⇞': ['pageup'],
    '⇟': ['pagedown'],
    '↑': ['up'],
    '↓': ['down'],
    '←': ['left'],
    '→': ['right']
  };

  var keyMap = {
    //general
    "3": ["cancel"],
    "8": ["backspace"],
    "9": ["tab"],
    "12": ["clear"],
    "13": ["enter"],
    // "16": ["shift"],
    // "17": ["ctrl"],
    // "18": ["alt", "menu", "option", "opt", "⎇"],
    "19": ["pause", "break"],
    "20": ["capslock"],
    "27": ["escape", "esc"],
    "32": ["space", "spacebar"],
    "33": ["pageup"],
    "34": ["pagedown"],
    "35": ["end"],
    "36": ["home"],
    "37": ["left"],
    "38": ["up"],
    "39": ["right"],
    "40": ["down"],
    "41": ["select"],
    "42": ["printscreen"],
    "43": ["execute"],
    "44": ["snapshot"],
    "45": ["insert", "ins"],
    "46": ["delete", "del"],
    "47": ["help"],
    // "91": ["command", "windows", "win", "super", "cmd", "⌘"],
    // "92": ["command", "windows", "win", "super", "cmd", "⌘"],
    "145": ["scrolllock", "scroll"],
    "186": ["semicolon", ";"],
    "187": ["equal", "equalsign", "="],
    "188": ["comma", ","],
    "189": ["dash", "-"],
    "190": ["period", "."],
    "191": ["slash", "forwardslash", "/"],
    "192": ["graveaccent", "`"],
    "219": ["openbracket", "["],
    "220": ["backslash", "\\"],
    "221": ["closebracket", "]"],
    "222": ["apostrophe", "'"],

    //0-9
    "48": ["zero", "0"],
    "49": ["one", "1"],
    "50": ["two", "2"],
    "51": ["three", "3"],
    "52": ["four", "4"],
    "53": ["five", "5"],
    "54": ["six", "6"],
    "55": ["seven", "7"],
    "56": ["eight", "8"],
    "57": ["nine", "9"],

    //numpad
    "96": ["numzero", "num0"],
    "97": ["numone", "num1"],
    "98": ["numtwo", "num2"],
    "99": ["numthree", "num3"],
    "100": ["numfour", "num4"],
    "101": ["numfive", "num5"],
    "102": ["numsix", "num6"],
    "103": ["numseven", "num7"],
    "104": ["numeight", "num8"],
    "105": ["numnine", "num9"],
    "106": ["nummultiply", "num*"],
    "107": ["numadd", "num+"],
    "108": ["numenter"],
    "109": ["numsubtract", "num-"],
    "110": ["numdecimal", "num."],
    "111": ["numdevide", "num/"],
    "144": ["numlock", "num"],

    //function keys
    "112": ["f1"],
    "113": ["f2"],
    "114": ["f3"],
    "115": ["f4"],
    "116": ["f5"],
    "117": ["f6"],
    "118": ["f7"],
    "119": ["f8"],
    "120": ["f9"],
    "121": ["f10"],
    "122": ["f11"],
    "123": ["f12"]
  };

  //secondary key symbols
  var macros = [
    ['shift + `', ["tilde", "~"]],
    ['shift + 1', ["exclamation", "exclamationpoint", "!"]],
    ['shift + 2', ["at", "@"]],
    ['shift + 3', ["number", "#"]],
    ['shift + 4', ["dollar", "dollars", "dollarsign", "$"]],
    ['shift + 5', ["percent", "%"]],
    ['shift + 6', ["caret", "^"]],
    ['shift + 7', ["ampersand", "and", "&"]],
    ['shift + 8', ["asterisk", "*"]],
    ['shift + 9', ["openparen", "("]],
    ['shift + 0', ["closeparen", ")"]],
    ['shift + -', ["underscore", "_"]],
    ['shift + =', ["plus", "+"]],
    ['shift + [', ["opencurlybrace", "opencurlybracket", "{"]],
    ['shift + ]', ["closecurlybrace", "closecurlybracket", "}"]],
    ['shift + \\', ["verticalbar", "|"]],
    ['shift + ;', ["colon", ":"]],
    ['shift + \'', ["quotationmark", "\""]],
    ['shift + ,', ["openanglebracket", "<"]],
    ['shift + .', ["closeanglebracket", ">"]],
    ['shift + /', ["questionmark", "?"]]
  ];

  //a-z and A-Z
  for (i = 65; i <= 90; i++) {
    keyMap[i] = String.fromCharCode(i + 32);
    macros.push(['shift + ' + String.fromCharCode(i + 32) + ', capslock + ' + String.fromCharCode(i + 32), [String.fromCharCode(i)]]);
  };

  var Cutshort = (function() {
    return {
      // 平台信息
      platform: navigator.userAgent.match(/Mac68K|MacPPC|Macintosh/) ? 'Mac' : 'PC',

      // 比较comboA是否是comboB的子集
      compareCombos: function(comboA, comboB) {
        var comboA = this.parseKeyCombo(comboA);
        var comboB = this.parseKeyCombo(comboB);
        for (var i in comboA) {
          if (comboB.indexOf(comboA[i]) == -1) return false;
        }
        return true;
      },

      parseKeyCombo: function(combo) {
        var _combo = [];
        if (_.isString(combo)) _combo = combo.split(' ');
        if (_.isArray(combo)) _combo = combo;
        if (_.isObject(combo)) {
          _.each(combo, function(val) {
            _combo.push(val);
          });
        }
        _combo = this.convertKeyName(_combo);
        return _combo;
      },

      // 根据keyName返查keyCode
      getKeyCode: function(keyName) {
        var keyCode = null;
        _.each(keyMap, function(val, key) {
          if (val.indexOf(keyName) > -1) keyCode = key;
        });
        return keyCode;
      },

      getKeyName: function(keyCode) {
        return keyMap[keyCode] || [];
      },

      /**
       * 转换keyName为对应系统下一致的名称(Ctrl > Alt > Shift)
       * @param  {string|array} keyCombo [Alt Command...]
       * @return {[type]}         [⌘ ⎇...]
       */
      convertKeyName: function(keyCombo) {
        var that = this;
        if (_.isString(keyCombo)) {
          var _combo = keyCombo.split(' ');
        } else if (_.isArray(keyCombo)) {
          var _combo = keyCombo;
        }
        var platformKeyNames = [];
        var symbolMap = this.platform == 'Mac' ? symbolMapForMac : symbolMap;

        _.each(_combo, function(keyName) {
          keyName = keyName.toLowerCase();
          var isSymbol = false;
          for (var key in symbolMap) {
            if (symbolMap[key].indexOf(keyName) > -1) {
              platformKeyNames.push(key);
              isSymbol = true;
              break;
            }
          }!isSymbol && platformKeyNames.push(keyName);
        });

        // 按Ctrl Alt Shift other/ Cmd Opt Shift other的顺序排序
        platformKeyNames.sort(function(a, b) {
          // 考虑到不在列表中的keyName，所以这里要将其倒顺写出来
          var keyOrder = that.platform == 'Mac' ? ['⇧', '⎇', '⌘'] : ['Shift', 'Alt', 'Ctrl'];
          return keyOrder.indexOf(a) < keyOrder.indexOf(b);
        });

        platformKeyNames = _.map(platformKeyNames, function(el) {
          // 转换第一个字符为大写
          if (!symbolMap[el]) {
            return el.substring(0, 1).toUpperCase() + el.substring(1);
          }
          return el;
        });

        return platformKeyNames;
      },

      /**
       * 绑定按键事件监听
       * @param  {string|array} [keyCombo] Like: 'Cmd Alt A' or ['Cmd', 'alt', 'a']
       * @param  {Function} callback  [事件回调]
       * @param  {string}   eventType [事件类型]
       * @return {[type]}             [description]
       */
      bindKeyEvent: function(keyCombo, callback, eventType) {
        var that = this,
          keyCombo = that.parseKeyCombo(keyCombo),
          callback = callback || null,
          eventType = eventType || 'keydown';

        $(document).on(eventType, function(e) {
          var eventKeyCombo = [];

          if (that.platform == 'Mac') {
            e.metaKey && eventKeyCombo.push('cmd');
            e.altKey && eventKeyCombo.push('opt');
          } else {
            e.ctrlKey && eventKeyCombo.push('ctrl');
            e.altKey && eventKeyCombo.push('alt');
          }
          e.shiftKey && eventKeyCombo.push('shift');

          if (e.keyCode && keyMap[e.keyCode]) {
            eventKeyCombo.push(keyMap[e.keyCode][0]);
          }

          if (that.compareCombos(keyCombo, eventKeyCombo)) {
            callback && callback(e, eventKeyCombo);
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }
    }
  })();

  module.exports = Cutshort;
});