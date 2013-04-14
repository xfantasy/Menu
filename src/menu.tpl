<div class='{{classPrefix}}'>
  <ul class='{{classPrefix}}-content'>

    {{#recursive menu}}
      <li class='clearfix {{#if this.disabled}} disabled {{/if}}
        {{#if this.class}} {{this.class}} {{/if}}' {{#if this.id}} id="{{this.id}}" {{/if}} data-uuid='{{this.uuid}}' >

        {{#if this.icon }}
          <i class='pull-left left-icon {{this.icon}}'></i>
        {{/if}}
        <span class='text'>{{this.text}}</span>

        {{#if this.menu}}
          <i class='pull-right icon-chevron-down'></i>
          <ul class='ui-menu-content'>
            {{{recursive this.menu}}}
          </ul>
        {{/if}}

        {{#if this.cutshort}}
          <span class='pull-right cutshort'>
            {{#each this.cutshort}}
              {{this}}
            {{/each}}
          </span>
        {{/if}}

      </li>
    {{/recursive}}

  </ul>
</div>

