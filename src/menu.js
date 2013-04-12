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
      classPrefix : 'ui-menu',    // 样式前缀
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
      triggerType : 'click',       // 触发事件 ['click', 'rightClick', 'contextMenu']
      hasMask : true,
      template : template,
      disabled : false,            // 是否禁用菜单
      callback : null              // 全局callback事件，在调用每个子菜单的callback后，会再次调用此事件
    },



    initAttrs: function(config, dataAttrsConfig) {
      Menu.superclass.initAttrs.call(this, config, dataAttrsConfig);
      this.model = convertModel(this);
    },



    events : {
      'mouseover li' : function(e) {
        this.itemMouseover(e);
      },
      'mouseout  li' : function(e) {
        this.itemMouseout(e);
      },
      'click li' : function(e) {
        this.doAction(e);
        var comnonCallback = this.get('callback');
        comnonCallback && comnonCallback(e, $(e.target).closest('li'));
      }
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
      $('li>ul', this.element).hide();
      return this;
    },



    render : function() {
      Menu.superclass.render.call(this);

      // 调整菜单的宽度到合适
      this._adjustMenuWidth();

      return this;
    },



    /**
     * 鼠标移动到菜单上时，展现子菜单
     * @return {[type]} [description]
     */
    itemMouseover: function(e) {
      var menuItem = $(e.target).closest('li');
      menuItem.siblings('li').removeClass('active').find('>ul').fadeOut(120);
      if (menuItem.hasClass('disabled')) return;

      menuItem.addClass('active');

      if (!$('>ul', menuItem).length) return false;

      // 定位子菜单
      var subMenu = $('>ul', menuItem);
      var subMenuOffset = (function() {
        // default value;
        var _offset = {
          left : menuItem.width() + 5,
          top  : 0
        };

        var menuItemOffset = menuItem.offset();
        if ((_offset.left + subMenu.width() + menuItemOffset.left) > $('body').width()) {
          _offset.left = -subMenu.width();
        }
        if ((menuItemOffset.top + subMenu.height()) > $('body').height()) {
          _offset.top = $('body').height() - (menuItemOffset.top + subMenu.height()) - 5;
        }
        return _offset;
      })();

      // 显示子菜单
      subMenu.css({
        'left': subMenuOffset.left,
        'top' : subMenuOffset.top
      }).fadeIn(120).find('li').removeClass('active').find('ul').hide();
    },

    itemMouseout : function(e) {
      var menuItem = $(e.target).closest('li');
      // menuItem.removeClass('active');
    },



    /**
     * 执行菜单的点击事件
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    doAction: function(e){
      e.stopPropagation();
      e.preventDefault();
      var target = $(e.target).closest('li');
      var uuid = target.data('id');

      var action = (function(list) {
        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i].uuid == uuid) {
            return list[i].action;
            break;
          }
          if (list[i].menu) {
            return arguments.callee(list[i].menu);
          }
        }
      })(this.get('menu'));

      if (!action) return; // do nothing.

      // URL
      if (typeof action == 'string' && /^(http[s]?:\/\/.*)$/.test(action)) {
        window.open(action);

      // Action
      } else if (_.isFunction(action)) {
        action(e);
      }

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

      (function(ulList) {
        for (var i = 0 , l = ulList.length; i < l; i++) {
          $(ulList[i]).show().width($(ulList[i]).width() + 15);
          if ($('>li>ul', ulList[i]).length) {
            //$('>li>ul', ulList[i]).css('left', currentListWidth);
            arguments.callee($('>li>ul', ulList[i]));
          }
        }
      })($('>ul', this.element));

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
        // uuid是联系element与menu的惟一key
        menu[i].uuid = list[i].uuid =  _.uniqueId('menu-');
        // 菜单文本
        menu[i].text = list[i].text;

        // id && class
        menu[i].id = list[i].id || undefined;
        menu[i].class = list[i].class || undefined;

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
        menu[i].disabled = list[i].disabled;
        // 快捷键
        if (list[i].cutshort) {
          menu[i].cutshort = (function(cutshort) {
            return $.map(cutshort.split(' '), function (el) {
              if (platform === 'Mac') {
                return el.replace(/(C|c)trl|(C|c)ommand|(C|c)md/g, '⌘').replace(/(A|a)lt|(O|o)ption|(O|o)pt/g, '⎇');
              } else if (platform === 'PC'){
                return el.replace(/(C|c)trl|(C|c)ommand|(C|c)md|⌘/g, 'Ctrl').replace(/(A|a)lt|(O|o)ption|(O|o)pt|⎇/g, 'Alt');
              }
            }).join('');
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












