# XTemplate API
---

## Class

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
                        <td>loader</td>
                        <td>Object</td>
                        <td>contains a load function to load included template</td>
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


## Methods


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

## TplWrap

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
        <td>scope</td>
        <td>Scope</td>
        <td>scope object when loader is invoked</td>
    </tr>
    <tr>
        <td>name</td>
        <td>String</td>
        <td>full name of template to be loaded</td>
    </tr>
    <tr>
        <td>originalName</td>
        <td>String</td>
        <td>originalName name of template to be loaded. for example: {{include('./a')}}; name is maybe /code/a, originalName is ./a</td>
    </tr>
</table>

### Members

## Buffer

### Members

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
    <tr>
        <td>tpl</td>
        <td>Object</td>
        <td>TplWrap object belonged to this buffer</td>
    </tr>
</table>

### Methods


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

## Scope


### Members


```javascript
parent // parent scope

root // topmost scope
```

### Methods


```javascript
void setParent(scope: Scope)

void setData(data) // set data of current scope

var getData()

void set(name, value) // set kv value of current scope

void get(name)
```

## custom command

### global command


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

## loader

a object which contains a load function (called when user invoke native include command) and passed to XTemplate config

```javascript
void load(tpl:TplWrap, callback:Function)
```

for example, XTemplate load precompiled template by require from modulex:

```javascript
var loader = {
    cache: {},
    load: function (tpl, callback) {
        var name = tpl.name;
        var cache = this.cache;
        if (cache[name]) {
            return callback(undefined, cache[name]);
        }
        require([name], {
            success: function (tpl) {
                cache[name] = tpl;
                callback(undefined, tpl);
            },
            error: function () {
                var error = 'template "' + params.name + '" does not exist';
                util.log(error, 'error');
                callback(error);
            }
        });
    }
};
```

## compiler

XTemplate.Compiler

### Methods

#### compile
```
Object compile(content, name): get compiled function of template whose content is content and name is name
```

#### parse
```
Object parse(content, name): get compiled ast of template whose content is content and name is name
```

#### compileToStr
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