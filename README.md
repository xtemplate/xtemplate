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

## 基本 api

### Class

XTemplate/XTemplateRuntime

构造器参数


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
        <td>模板字符串</td>
    </tr>
    <tr>
            <td>config</td>
            <td>Object</td>
            <td>
            对象属性含义：
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
                        <td>模板名字，用于编译时报错</td>
                    </tr>
                    <tr>
                        <td>commands</td>
                        <td>Object</td>
                        <td>命令定义，详见下文</td>
                        </tr>
                    </tbody>
                </table></td>
        </tr>
    </tbody>
</table>


### Methods


```javascript
String render(data:Object, [option:Object, callback:Function]) // 渲染数据，参数含义如下
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
          <td>数据对象</td>
      </tr>
      <tr>
          <td>option</td>
          <td>Object</td>
          <td>运行时选项，支持 commands，例如 {commands: {}}</td>
      </tr>
      <tr>
          <td>callback</td>
          <td>Function</td>
          <td>完毕回调，第一个参数为 error，第二个参数为渲染结果。如果不提供，同步命令下 render 返回渲染结果。</td>
      </tr>
    </tbody>
</table>

### Buffer api

#### Methods


```javascript
Buffer write(data:String, escape:Boolean) // 写数据到缓冲区
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
        <td>将要写到缓冲区的字符串</td>
    </tr>
    <tr>
            <td>escape</td>
            <td>Boolean</td>
            <td>是否转义</td>
        </tr>
    </tbody>
</table>



```javascript
Buffer async(fn:Function) // 产生新的异步缓冲区，新的缓冲区为 fn 回调函数的第一个参数

Buffer end(data, escape) // 参数含义同 write 函数。 标志缓冲区数据填充完毕，用于通知异步缓冲区的结束。

Buffer error(reason) // 触发 render 异步回调为失败。 reason 为回调的第一个参数.
```

### Scope api


#### Members


```javascript
parent // 上级作用域

root // 顶层作用域
```

#### Methods


```javascript
void setParent(scope: Scope) // 设置当前作用域的上级作用域

void setData(data) // 设置当前作用域内数据

var getData() // 获取当前作用域内数据

void set(name, value) // 设置当前作用域内附属数据

void get(name) // 获取当前作用域内数据值（包括附属数据）
```

### compiler api

XTemplate.Compiler

#### Methods

##### compile
```
Object parse(content, name): 得到模板名字为 name 的模板内容 content 对应的编译后的函数
```

##### parse
```
Object parse(content, name): 得到模板名字为 name 的模板内容 content 对应的 ast 树
```

##### compileToStr
```
String compileToStr(param:Object): 得到编译后的函数字符串
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
        <td>模板名字</td>
    </tr>
    <tr>
        <td>content</td>
        <td>String</td>
        <td></td>
        <td>模板内容</td>
    </tr>
    <tr>
        <td>isModule</td>
        <td>Boolean</td>
        <td>false</td>
        <td>是否用于模块</td>
    </tr>
    </tbody>
</table>

## 浏览器端使用

参考：https://github.com/yiminghe/xtemplate-browser

### 预编译

推荐首先将模板预编译为模块：https://github.com/kissyteam/gulp-xtemplate

### standalone 模式

载入 build/xtemplate-standalone.js 或 build/xtemplate/runtime-standalone.js 使用全局变量即可，不支持 include 语法

### 动态加载模式

将 modulex 与 build/ 下的文件放到同一目录

### kissy 使用

```html
<script src='http://g.assets.daily.taobao.net/kissy/k/1.4.7/seed-min.js'></script>
<script>
	KISSY.use('x/x-render',function(S,XRender){
    	console.log(XRender({x:1}));
    });
</script>
```

## node 下使用

https://github.com/kissyteam/xtpl

## 语法

### 基本类型

支持 true false null undefined number string map array

### map
值为基本类型

```
{{#with({
  x:2
})}}
{{x}}  // => 2
{{/with}}
```

### array
元素项为基本类型

```
{{#each([1,2,4])}}
{{this}}  // => 1 2 4
{{/each}}
```

### 转义

#### 使用 {{%%}}

```
{{%

{{x}}

%}}  // => {{x}}
```

#### 使用 \\{{

```
\{{a}}  // -> {{a}}
```

#### angularjs

如果是 angularjs 的话，可以直接配置 angularjs 使用不同的标记

[http://stackoverflow.com/questions/13671701/angularjs-twig-conflict-with-double-curly-braces](http://stackoverflow.com/questions/13671701/angularjs-twig-conflict-with-double-curly-braces)

### 注释


```
{{! zhu shi }}
```

### 变量渲染

转义：

```
{{x}}
```

非转义:

```
{{{x}}}
```

### 根数据访问

```javascript
var x = {name:1,arr:[{name:2}]}
```

```
{{#each(arr)}}
{{root.name}}{{name}} {{! 12 }}
{{/each}}
```

### 支持变量属性获取


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

### 调用变量方法

注意：该用法会影响性能，推荐自定义命令

```javascript
var x = [1, 2, 3];
```

```
{{#each(x.slice(1))}}{{this}} {{/each}} // => 2 3
```

### 变量运算

支持 + - * / %

```
{{x+y}}
{{x + "1"}}
{{ y - 1 }}
```

### 比较操作

支持 if elseif else === !=== > >= < <=

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

### 逻辑操作

支持 || &&

```
{{#if(x>1 && y<2)}}
{{/if}}
```

```
{{#if(!x)}}
{{/if}}
```

### 循环

可以对数组或对象进行循环操作，默认获取循环对象值为 {{this}}，键为 {{xindex}} , 也可以指定.

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

### 范围循环

可以对 start 和 end(不包含) 范围内的数字进行循环

```
{{#each(range(0,3))}}{{this}}{{/each}} // 012
{{#each(range(3,0))}}{{this}}{{/each}} // 321
{{#each(range(3,0,2))}}{{this}}{{/each}} // 31
```

### 设置操作


```
{{set(x=1)}}
{{set(y=3,z=2)}}
{{x}} // 1
{{y+z}} // 5
```

### 宏


```
// 声明
{{#macro("test","param" default=1)}}param is {{param}} {{default}}{{/macro}}

// 调用宏
{{macro("test","2")}} // => param is 2 1

{{macro("test", "2", 2)}} // => param is 2 2
```

### 包含操作

x.xtpl

```
{{z}}
```

y.xtpl

```
{{include("x")}}
```

### 继承

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

// 填
{{#block ("head")}}
    <link type="text/css" href="test.css" rev="stylesheet" rel="stylesheet"/>
{{/block}}

// 填
{{#block ("body")}}
    <h2>{{title}}</h2>
{{/block}}
```

### 自定义命令


#### 全局命令


同步调用行内：

```javascript
XTemplate.addCommand('xInline',function(scope, option){
  return option.params[0]+'1';
});
```

此时模板中可通过 {{}} 来转义命令返回的内容.


或使用 buffer (详见下面 Buffer api)

```javascript
XTemplate.addCommand('xInline',function(scope, option, buffer){
  return buffer.write(option.params[0] + 1);
});
```

此时模板不能控制命令返回内容是否转义.

```
{{xInline(1)}} // => 2
```

同步调用块级：

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

异步调用行内

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

异步调用块级：

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

**Xtemplate内置以下命令，请避免重复定义同名命令**

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