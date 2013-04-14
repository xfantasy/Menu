# 演示文档

---

<link rel="stylesheet" type="text/css" href="http://assets.t326.alipay.net/alice/famicons/1.0.0/famicons.css">
<link rel="stylesheet" type="text/css" href="http://assets.t326.alipay.net/al/alice.common.bizdev-1.3-SNAPSHOT-src.css">

## 左键菜单
<a href="#" id="J-trigger-left">Click Me</a>

## 右键菜单
<a href="#" id="J-trigger-right">Right Click Me</a>


````javascript
seajs.use(['$', 'menu'], function($, Menu){
  window.$ = $;

  new Menu({
    trigger : '#J-trigger-left',
    action : function(e, menuItem) {
      if ($(menuItem).attr('id') == 'J-menu-id') {
        console.log('你点击了J-menu-id');
      }
      if ($(menuItem).hasClass('J-menu-class')) {
        console.log('你点击了J-menu-class');
      }
    },
    menu : [
      {
        id        : 'J-menu-id',
        icon      : '.icon-tags',
        text      : 'Edit',
        cutshort  : 'Ctrl E',
        action    : function() {
          alert(123456);
        }
      },
      {
        text      : 'Cut',
        url       : 'http://www.google.com/',
        target    : '_blank'
      },
      {
        text      : 'Copy',
        disabled  : true,
        cutshort  : 'Cmd Space'
      },
      {
        text      : 'Command',
        menu      : [
          {
            text : 'Command A',
            class : 'J-menu-class'
          },
          {
            cutshort  : 'Alt S',
            class : 'J-menu-class',
            text : 'Command B',
            action : 'http://www.google.com'
          },
          {
            icon      : '.icon-tags',
            class : 'J-menu-class',
            text : 'Command C',
            menu : [
              { text : 'Command C - 1'},
              { text : 'Command C - 2'},
              { text : 'Command C - 3'},
              { text : 'Command C - 4', action: function(e, data) {
                window.open('http://www.baidu.com/');
              }},
              { text : 'Command C - 5', action : function(e, data) {
                console.log(e, data);
              }}
            ]
          }
        ]
      },
      {
        cutshort  : 'Opt Ctrl U',
        text : '这个菜单的文字超级的长啊长啊长啊长啊长啊长'
      }
    ]
  }).render();

  new Menu({
    trigger : '#J-trigger-right',
    triggerType : 'rightClick',
    menu : [
      { text : 'context Menu 1' },
      { text : 'context Menu 2' }
    ]
  }).render();
});
````
