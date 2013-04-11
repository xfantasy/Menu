define(function(require, exports, module) {
  var Handlebars = require('handlebars');

  var audaciousFn;
  Handlebars.registerHelper('recursive', function(list, options) {
    var out = [];
    if (options.fn !== undefined) {
      audaciousFn = options.fn;
    }

    list.forEach(function(item) {
      audaciousFn && out.push(audaciousFn(item));
    });
    return out.join('');
  });

  return "<div class='{{classPrefix}}'>\n\
    <ul class='{{classPrefix}}-content'>\n\
      {{#recursive menu}}\
        <li>\n\
          {{#if this.icon }}\
            <i class='{{classPrefix}}-item-left-icon {{this.icon}}'></i>\n\
          {{/if}}\
          <span class='{{classPrefix}}-item-text'>{{this.text}}</span>\n\
          {{#if this.cutshort}}\
            <span class='{{classPrefix}}-cutshort'></span>\n\
          {{/if}}\n\
          {{#if this.menu}}\
            <i class='pull-right fam-resultset-next'></i>\n\
            <ul class='{{classPrefix}}-content'>\n\
              {{{recursive this.menu}}}\
            </ul>\n\
          {{/if}}\
        </li>\n\
      {{/recursive}}\
    </ul>\n\
  </div>";
});

