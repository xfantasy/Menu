/**
 * TODO:
 * 1. 快捷键支持
 *   1.1 分离按键事件管理到cutshort.js
 *   1.2 Menu自身只负责托管MenuList中的快捷键列表
 *   1.3 cutshort.js在每次keyevent时，通知MenuList.js(即MenuList监听cutshort的事件)
 *   1.4 由cutshort.js来提供多系统支持
 * 2. 对菜单过长的情况做兼容性处理
 * 3. 将Menu.js中，组件行为与DOM事件做完全分离，以期能通过外部调用触发对应的动作
 *   3.1 doAction / click 事件的分离
 *
 */

define(function(require, exports, module) {

  var $ = require('$'),
      Overlay = require('overlay'),
      _ = require('underscore'),
      Templatable = require('templatable'),
      Cutshort = require('./cutshort.js'),
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
          baseXY: ['-1px', '100%-1px']
      },
      triggerType : 'click',       // 触发事件 ['click', 'rightClick', 'contextMenu']
      hasMask : true,
      beforeShow : null,
      afterShow : null,
      beforeHide : null,
      afterHid : null,
      template : template,
      disabled : false,            // 是否禁用菜单
      action   : null              // 全局callback事件，在调用每个子菜单的 action 后，会再次调用此事件
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
        this.hide();

        e.stopPropagation();
        e.preventDefault();

      }
    },



    setup : function() {

      this.bindToggleEvent();
      this.bindCutshort();

      // 调用Overlay的方法，点击body隐藏菜单
      this._blurHide([this.get('trigger')]);
      this._tweakAlignDefaultValue();

      Menu.superclass.setup.call(this);
    },



    show : function() {
      _.isFunction(this.get('beforeShow')) && this.get('beforeShow')();

      Menu.superclass.show.call(this);
      $(this.element).show();
      $(this.get('trigger')).addClass('active');
      this._setPosition();
      $('li>ul', this.element).hide();

      _.isFunction(this.get('afterShow')) && this.get('afterShow')();
      return this;
    },


    hide : function() {

      _.isFunction(this.get('beforeHide')) && this.get('beforeHide')();

      this.element.hide();
      $(this.get('trigger')).removeClass('active');

      _.isFunction(this.get('afterHide')) && this.get('afterHide')();

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

        // TODO: 当菜单同时超出上下边界时，需要配置滚动条
        // 同时超出左右边界时怎么办? 没见过这么变态的菜单!!
        var menuItemOffset = menuItem.offset();
        // 超出右边界
        if ((_offset.left + subMenu.width() + menuItemOffset.left) > document.documentElement.clientWidth) {
          _offset.left = -subMenu.width();
        }
        // 超出下边界
        if ((menuItemOffset.top + subMenu.height()) > document.documentElement.clientHeight) {
          _offset.top = document.documentElement.clientHeight - (menuItemOffset.top + subMenu.height()) - 5;
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
      // var menuItem = $(e.target).closest('li');
    },



    /**
     * 执行菜单的点击事件
     * @param  {event} e [description]
     * @return {null}
     */
    doAction: function(e) {
      var uuid = $(e.target).closest('li').data('uuid')
      if (!uuid) return;

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

      // URL
      if (typeof action == 'string') {
        window.location.href = action;

      // Action
      } else if (_.isFunction(action)) {
        try{
          action(e, uuid);
        } catch(e) {
          console.error('action error: ' + e);
        }
      }

      // 公共方法
      var comnonAction = this.get('action');
      if (comnonAction) {
        try{
          comnonAction(e, uuid);
        } catch(e) {
          console.error('common action error : ' + e);
        }
      }

    },



    /**
     * 预定义的事件发生时，则显示出菜单来
     * @return {[type]} [description]
     */
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


    /**
     * 全局快捷键事件
     * @return {[type]} [description]
     */
    bindCutshort: function() {
      var that = this;
      /**
       * 1. 搜罗所有的快捷键
       * 2. 监听全局的keypress事件
       * 3. 对比，如果有符合的，则回调之
       */
       (function(list) {
        for (var i = 0, l = list.length; i < l; i++) {
          if (!list[i].cutshort) continue;
          (function(cutshort, uuid) {
            Cutshort.bindKeyEvent(cutshort, function(e, keyCombo) {
              that.doAction(uuid);
            });
          })(list[i].cutshort, list[i].uuid);
          if (list[i].menu) arguments.callee(list[i].menu);
        };
       })(this.model.menu)
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
            arguments.callee($('>li>ul', ulList[i]));
          }
        }
      })($('>ul', this.element));
      that.hide();
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
        if (list[i].action) menu[i].action = list[i].action;
        // 分割线
        menu[i].split = list[i].split || false;

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
            return Cutshort.convertKeyName(cutshort);
            // return $.map(cutshort.split(' '), function (el) {
            //   if (platform === 'Mac') {
            //     return el.replace(/(C|c)trl|(C|c)ommand|(C|c)md/g, '⌘').replace(/(A|a)lt|(O|o)ption|(O|o)pt/g, '⎇');
            //   } else if (platform === 'PC'){
            //     return el.replace(/(C|c)trl|(C|c)ommand|(C|c)md|⌘/g, 'Ctrl').replace(/(A|a)lt|(O|o)ption|(O|o)pt|⎇/g, 'Alt');
            //   }
            // }).join('');
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












