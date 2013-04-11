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
    menu : [
      {
        icon      : '.icon-tags',
        text      : 'Edit',
        cutshort  : 'Ctrl E',
        action    : function(e) {
          console.log(e);
          alert(123456);
        }
      },
      {
        text      : 'Cut',
        url       : 'http://www.google.com/',
        target    : '_blank'
      },
      {
        text      : 'Copy'
      },
      {
        text      : 'Command',
        menu      : [
          {
            text : 'Command A'
          },
          {
            text : 'Command B'
          },
          {
            icon      : '.icon-tags',
            text : 'Command C',
            cutshort  : 'Alt S',
            menu : [
              { text : 'Command C - 1'},
              { text : 'Command C - 2'},
              { text : 'Command C - 3'},
              { text : 'Command C - 4'},
              { text : 'Command C - 5'}
            ]
          }
        ]
      },
      {
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
