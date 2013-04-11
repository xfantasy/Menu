define(function(require, exports, module) {

  var $ = require('$'),
      Overlay = require('overlay'),
      _ = require('underscore'),
      Templatable = require('templatable'),
      template = require('./menu.tpl');

  require('./style.css');

  // 用于在递归中保存上一次的处理器
  // TODO: 怎么把它移到一个更好的位置呢？
  var audaciousFn;

  var Menu = Overlay.extend({

    // 模板引擎
    Implements : Templatable,

    // 自定义递归模板
    templateHelpers : {
      recursive : function(list, options) {
        var out = [];
        if (options.fn !== undefined) {
          audaciousFn = options.fn;
        }
        list.forEach(function(item) {
          audaciousFn && out.push(audaciousFn(item));
        });
        return out.join('');
      }
    },

    // 组件属性
    attrs : {

      classPrefix : 'ui-menu',

      trigger: {
          value: null, // required
          getter: function(val) {
            return $(val).eq(0);
          }
      },

      // 定位配置
      align: {
          baseXY: ['5px', '100%-1px']
      },

      triggerType : 'click',

      hasMask : true,

      template : template,

      disabled : false
    },

    initAttrs: function(config, dataAttrsConfig) {
      Menu.superclass.initAttrs.call(this, config, dataAttrsConfig);
      this.model = convertModel(this);
    },

    setup : function() {

      this.bindToggleEvent();

      // 调用Overlay的方法，点击body隐藏菜单
      this._blurHide([this.get('trigger')]);

      this._tweakAlignDefaultValue();


      Menu.superclass.setup.call(this);
    },

    show : function() {
      Menu.superclass.show.call(this);
      this._setPosition();
      return this;
    },

    render : function() {
      Menu.superclass.render.call(this);

      // 调整菜单的宽度到合适
      this._adjustMenuWidth();

      return this;
    },

    bindToggleEvent : function() {
      var that = this;
      var trigger = this.get('trigger');
      var triggerEvent = (this.get('triggerType') == 'rightClick' ||
        this.get('triggerType') == 'contextmenu') ? 'contextmenu' : 'click';

      $(trigger).on(triggerEvent, function(e) {
        if (!that.get('disabled')) {
          that.show();
        }
        e.preventDefault();
      })
    },

    toggleMenu: function() {
      $(this.element).slideToggle();
    },

    // borrow from dropdown
    // 调整 align 属性的默认值, 在 trigger 下方
    _tweakAlignDefaultValue: function() {
        var align = this.get('align');
        // 默认基准定位元素为 trigger
        if (align.baseElement._id === 'VIEWPORT') {
            align.baseElement = this.get('trigger');
        }
        this.set('align', align);
    },

    // 调整所有菜单项的宽度到合适（即刚好展示在一行内）
    _adjustMenuWidth: function() {

      var that = this;

      $(that.element).show();

      // 测算行高
      var lineHeight = (function() {
        $('>ul', that.element).append('<li>X</li>');
        var lineHeight = $('>ul>li:last', that.element).height();
        $('>ul>li:last', that.element).remove();
        return lineHeight;
      })();

      (function(list) {
        for (var i = 0, l = list.length; i < l; i++) {
          list[i] = $(list[i]);
          while(list[i].height() > lineHeight) {
            list[0].parent().width(list[0].parent().width() + 10);
          }
          if ($('>ul>li', list[i]).length) {
            $('>ul', list[i]).css('left', list[i].width());
            arguments.callee($('>ul>li', list[i]));
          }
        }
      })($('>ul>li', this.element));

      $(that.element).hide();
    }
  });

  module.exports = Menu;

  /**
   * 转换数据为template所需要的格式，以及做一些兼容处理
   * @return {JSON}      [model数据]
   */
  var convertModel = function(that) {
    var platform = navigator.userAgent.match(/Mac68K|MacPPC|Macintosh/) ? 'Mac' : 'PC';
    var model = {};
    model.classPrefix = that.get('classPrefix');

    // 递归处理所有数据
    model.menu = (function(list) {
      var menu = [];
      for (var i = 0, l = list.length; i < l; i++) {
        menu[i] = {};
        // 菜单文本
        menu[i].text = list[i].text;
        // 图标处理（图标类型及图标源码）
        if (list[i].icon) {
          if (list[i].icon.indexOf('.') === 0) {
            menu[i].iconType = 'class';
            menu[i].icon = list[i].icon.substr(1);
          } else if (list[i].icon.indexOf('#') === 0) {
            menu[i].iconType = 'id';
            menu[i].icon = list[i].icon.substr(1);
          } else if (list[i].icon.indexOf('http') === 0) {
            menu[i].iconType = 'http';
            menu[i].icon = '<img src="' + list[i].icon + '" />';
          } else if (list[i].icon.indexOf('<') === 0) {
            menu[i].iconType = 'http';
            menu[i].icon = list[i].icon;
          }
        }
        // 快捷键
        if (list[i].cutshort) {
          menu[i].cutshort = (function(cutshort) {
            return $.map(cutshort.split(' '), function (el) {
              if (platform === 'Mac') {
                return el.replace(/(C|c)trl|(C|c)ommand|(C|c)md/g, '⌘').replace(/(A|a)lt|(O|o)ption|(O|o)pt/g, '⎇');
              } else if (platform === 'PC'){
                return el.replace(/(C|c)trl|(C|c)ommand|(C|c)md|⌘/g, 'Ctrl').replace(/(A|a)lt|(O|o)ption|(O|o)pt|⎇/g, 'Alt');
              }
            }).join(' ');
          })(list[i].cutshort);
        }
        if (list[i].menu) {
          menu[i].menu = arguments.callee(list[i].menu);
        }
      }
      return menu;
    })(that.get('menu'));

    return model;
  };
});








var c = 10 - 3;
var a = 1;
while(a < 9) {
  a += 1;
}

var a = 1;
if (a > 1) {
  a = 0;
}

for (var i = 1, j = 9; i < j; i++) {
  console.log(i);
}













