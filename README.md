# xtemplate

template engine lib on browser and nodejs

[![xtemplate](https://nodei.co/npm/xtemplate.png)](https://npmjs.org/package/xtemplate)
[![NPM downloads](http://img.shields.io/npm/dm/xtemplate.svg)](https://npmjs.org/package/xtemplate)
[![Build Status](https://secure.travis-ci.org/kissyteam/xtemplate.png?branch=master)](https://travis-ci.org/kissyteam/xtemplate)
[![Coverage Status](https://img.shields.io/coveralls/kissyteam/xtemplate.svg)](https://coveralls.io/r/kissyteam/xtemplate?branch=master)
[![Dependency Status](https://gemnasium.com/kissyteam/xtemplate.png)](https://gemnasium.com/kissyteam/xtemplate)
[![Bower version](https://badge.fury.io/bo/xtemplate.svg)](http://badge.fury.io/bo/xtemplate)

[![browser support](https://ci.testling.com/kissyteam/xtemplate.png)](https://ci.testling.com/kissyteam/xtemplate)

## docs

### Class

XTemplate/XTemplateRuntime

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">name</th>
        <th style="width: 50px;">type</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>content</td>
        <td>String</td>
        <td>template content string</td>
    </tr>
    <tr>
            <td>config</td>
            <td>Object</td>
            <td>
            <table class="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th style="width: 100px;">name</th>
                        <th style="width: 50px;">type</th>
                        <th>description</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>name</td>
                        <td>String</td>
                        <td>name of template for error report</td>
                    </tr>
                    <tr>
                        <td>commands</td>
                        <td>Object</td>
                        <td>command definition</td>
                        </tr>
                    </tbody>
                </table></td>
        </tr>
    </tbody>
</table>


### Methods


```javascript
String render(data:Object, [option:Object, callback:Function]) // render data
```

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">name</th>
        <th style="width: 50px;">type</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
      <tr>
          <td>data</td>
          <td>Object</td>
          <td>data object to be rendered</td>
      </tr>
      <tr>
          <td>option</td>
          <td>Object</td>
          <td>support runtime commands. for example: {commands: {}}</td>
      </tr>
      <tr>
          <td>callback</td>
          <td>Function</td>
          <td>callback function after render</td>
      </tr>
    </tbody>
</table>

### Buffer api

#### Methods


```javascript
Buffer write(data:String)
```

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">name</th>
        <th style="width: 50px;">type</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>data</td>
        <td>String</td>
        <td>string to be written into buffer</td>
    </tr>
</table>

```javascript
Buffer writeEscaped(data:String)
```

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">name</th>
        <th style="width: 50px;">type</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>data</td>
        <td>String</td>
        <td>first escape string, then write it into buffer</td>
    </tr>
</table>

```javascript
Buffer async(fn:Function) // generate a new buffer as the first parameter of callback

Buffer end() // mark escape of current buffer

Buffer error(reason) // mark error of current render
```

### Scope api


#### Members


```javascript
parent // parent scope

root // topmost scope
```

#### Methods


```javascript
void setParent(scope: Scope)

void setData(data) // set data of current scope

var getData()

void set(name, value) // set kv value of current scope

void get(name)
```

### compiler api

XTemplate.Compiler

#### Methods

##### compile
```
Object compile(content, name): get compiled function of template whose content is content and name is name
```

##### parse
```
Object parse(content, name): get compiled ast of template whose content is content and name is name
```

##### compileToStr
```
String compileToStr(param:Object): get function string of template whose content is content and name is name
```

param 包含:

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">name</th>
        <th style="width: 50px;">type</th>
        <th style="width: 50px;">default</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>name</td>
        <td>String</td>
        <td></td>
        <td>name of template</td>
    </tr>
    <tr>
        <td>content</td>
        <td>String</td>
        <td></td>
        <td>content of template</td>
    </tr>
    <tr>
        <td>isModule</td>
        <td>Boolean</td>
        <td>false</td>
        <td>whether generate module require</td>
    </tr>
    </tbody>
</table>

## use on browser

refer：https://github.com/yiminghe/xtemplate-on-browser

## use on node

use https://github.com/kissyteam/xtpl

## syntax

### simple data type

true false null undefined number string map array

### map

```
{{#with({
  x:2
})}}
{{x}}  // => 2
{{/with}}
```

### array

```
{{#each([1,2,4])}}
{{this}}  // => 1 2 4
{{/each}}
```

### escape

#### {{%%}}

```
{{%

{{x}}

%}}  // => {{x}}
```

####  \\{{

```
\{{a}}  // -> {{a}}
```

#### angularjs conflict

[http://stackoverflow.com/questions/13671701/angularjs-twig-conflict-with-double-curly-braces](http://stackoverflow.com/questions/13671701/angularjs-twig-conflict-with-double-curly-braces)

### comment


```
{{! zhu shi }}
```

### variable

escaped：

```
{{x}}
```

unescaped:

```
{{{x}}}
```

### root data

```javascript
var x = {name:1,arr:[{name:2}]}
```

```
{{#each(arr)}}
{{root.name}}{{name}} {{! 12 }}
{{/each}}
```

### property access


```javascript
var x = {
    y: 1
};
var y = [1, 2, 3];
var z = {
    q: 1
};
var x = 'q';
```

```
{{x.y}} // 1
{{y[1]}} // 2
{{z[x]}} // 1
```

### methods of data

```javascript
var x = [1, 2, 3];
```

```
{{#each(x.slice(1))}}{{this}} {{/each}} // => 2 3
```

### operation

+ - * / %

```
{{x+y}}
{{x + "1"}}
{{ y - 1 }}
```

### comparison

if elseif else === !=== > >= < <=

```
{{#if( x===1 )}}
1
{{elseif (x===2)}}
2
{{else}}
3
{{/if}}

{{#if ( (x+1) > 2 )}}
{{/if}}
```

### logic

|| &&

```
{{#if(x>1 && y<2)}}
{{/if}}
```

```
{{#if(!x)}}
{{/if}}
```

### loop

```javascript
var x = ['a', 'b'];
```

```
{{#each(x)}}
{{xindex}} {{this}} // 0 a 1 b
{{/each}}

{{#each(x,"value","key")}}
{{key}} {{value}} // 0 a 1 b
{{/each}}
```

### range

```
{{#each(range(0,3))}}{{this}}{{/each}} // 012
{{#each(range(3,0))}}{{this}}{{/each}} // 321
{{#each(range(3,0,2))}}{{this}}{{/each}} // 31
```

### set


```
{{set(x=1)}}
{{set(y=3,z=2)}}
{{x}} // 1
{{y+z}} // 5
```

### macro


```
// declare
{{#macro("test","param" default=1)}}param is {{param}} {{default}}{{/macro}}

// call
{{macro("test","2")}} // => param is 2 1

{{macro("test", "2", 2)}} // => param is 2 2
```

### include

x.xtpl

```
{{z}}
```

y.xtpl

```
{{include("x")}}
```

### extend

layout.xtpl

```html
<!doctype html>
<html>
    <head>
        <meta name="charset" content="utf-8" />
        <title>{{title}}</title>
        {{{block ("head")}}} // 坑
    </head>
    <body>
        {{{include ("./header")}}}
        {{{block ("body")}}}  // 坑
        {{{include ("./footer")}}}
    </body>
</html>
```

index.xtpl

```html
{{extend ("./layout1")}}

{{#block ("head")}}
    <link type="text/css" href="test.css" rev="stylesheet" rel="stylesheet"/>
{{/block}}

{{#block ("body")}}
    <h2>{{title}}</h2>
{{/block}}
```

### custom command


#### global command


sync inline command

```javascript
XTemplate.addCommand('xInline',function(scope, option){
  return option.params[0]+'1';
});
```

use buffer

```javascript
XTemplate.addCommand('xInline',function(scope, option, buffer){
  return buffer.write(option.params[0] + 1);
});
```


```
{{xInline(1)}} // => 2
```

sync block command

```javascript
XTemplate.addCommand('xBlock',function(scope, option, buffer){
  return option.fn(scope, buffer).write(option.params[0]);
});
```

```
{{#xBlock(1)}}
2
{{/xBlock}}
// => 21
```

async inline command

```javascript
XTemplate.addCommand('xInline',function(scope, option,buffer){
  buffer = buffer.async(function(newBuffer){
    setTimeout(function(){
        newBuffer.write(option.params[0] + 1).end();
    },10);
  });
  return buffer;
});
```

```
{{xInline(1)}} // => 2
```

async block command

```javascript
XTemplate.addCommand('xInline',function(scope, option,buffer){
  buffer = buffer.async(function(newBuffer){
    setTimeout(function(){
        var newScope = xtpl.XTemplate.Scope({ret:2});
        newScope.setParent(scope);
        option.fn(newScope, newBuffer);
    },10);
  });
  buffer.write(option.params[0]);
  return buffer;
});
```

```
{{#xBlock(1)}}
{{ret}}
{{/xBlock}}
// => 21
```


## Reserved words

<table>
    <tr>
        <td>block</td><td>debugger</td><td>each</td><td>extend</td>
    </tr>
    <tr>
        <td>if</td><td>include</td><td>marco</td><td>parse</td>
    </tr>
    <tr>
        <td>range</td><td>set</td><td>with</td><td></td>
    </tr>
</table>

## changelog

* 1.2.1
 * improve speed
 * compiled code changed

* 1.1.1
 * improve speed
 * compiled code changed
 * buffer.write only support unescaped write
 * add buffer.writeEscaped to write escaped write

## contribute

### fork and clone

### prepare environment
```
npm install bower -g
npm install
bower install
node server
```

then open http://localhost:8002/tests/runner.html

### open issue

### modify code at lib

### commit and pull request