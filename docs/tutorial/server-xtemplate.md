# xtemplate on server
---

By minghe36@126.com

xtemplate除了在浏览器端使用外，还可以在服务器端使用，比如结合Node.js的express或koa框架使用。

通常express搭配的模板引擎是jade，但jade的写法与原生html差很远，不习惯的话不妨试试xtemplate。

## 在express中使用xtemplate
一个demo工程，xtemplate的模板都放在views目录下。

需要安装express、xtpl、xtemplate 模块，package.json：

```js
{
    "name": "xtemplate-express-demo",
    "description": "xtemplate on express demo",
    "devDependencies": {
        "express": "~3.4.8",
        "xtemplate": "^3.1.0",
        "xtpl": "^3.1.0"
    }
}
```

xtpl 是xtemplate模板引擎针对express和koa的适配器。

开启xtpl对express的适配：

```js
var xtpl = require('xtpl');
//开启express适配
xtpl.__express = xtpl.renderFile;
```

配置http服务：

```js
var http = require('http');
var app = require('express')();
server = http.createServer(app);
app.set('views','./views');
//留意模板引擎使用xtpl，而不是jade
app.set('view engine', 'xtpl');
app.set('port', 3000);

server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
```

在views下放一个简单的模板，比如simple.xtpl，模板内容如下：

```
<h1>{{title}}</h1>
<p>这是一个简单的demo</p>
```

起一个简单地路由渲染此模板：

```js
app.get('/simple',function(req, res){
    res.render('simple',{title:'xtemplate'});
});
```

res.render() 第一个参数为模板名，simple 指向的是views/simple.xtpl，第二个参数为数据。

运行命令：node app.js 后访问 http://localhost:3000/simple，就可以看到渲染接过，就这么简单！

## xtemplate在实际业务中的应用
在实际业务中模板会比较复杂，为了方便维护，我们会把模板抽成多个部分。比如通用于所有页面的layout（页面结构），多个页面通用的模板，方便维护。

起个首页路由：

```js
app.get('/index',function(req, res){
    res.render('index',{title:'xtemplate',content:'this is demo'});
});
```

index.xtpl使用，通用的pc layout：

```js
{{extend ("./layout/pc/pc")}}
```

使用extend 语法，让index模板继承个layout模板，这样就拥有这个layout的模板内容。

但是，layout的head和body的内容，各个页面都不同，我们如何将index页面模板内容插入到layout的head和body呢？

layout 增加二个block（块）定义：

```js
<head>
    {{{block ("head")}}}
</head>
<body>
    {{{block ("body")}}}
</body>
```

（必须留意：block语法需要三个{！！！坑爹的语法糖）

这样我们就可以在index.xtpl中定义这二个block的内容：

```
{{#block ("head")}}
    <style>
        p{
            line-height: 24px;
        }
    </style>
{{/block}}

{{#block ("body")}}
    <p>这是正文</p>
{{/block}}
```

（留意：这里的block语法不需要三个{！！！）

## 使用子模板
xtemplate 跟大多数模板一样，是支持include子模板的，比如有个子模板demo.xtpl，在index.xtpl中使用：

```
{{#block ("body")}}
    <p>这是正文</p>
    {{{include ("./mod/demo")}}}
{{/block}}
```

（特别留意：include语法需要三个{！！！）

## 在koa中使用xtemplate
koa与express只是使用上有些差异：一个简单的demo工程。

```js
var koa = require('koa');
//使用跟express相似的路由器
var router = require('koa-router');
var app = koa();
app.use(router(app));
```

开启xtemplate对koa的适配：

```js
//xtpl模板引擎对koa的适配
var xtplApp = require('xtpl/lib/koa');
//xtemplate模板渲染
xtplApp(app,{
    //配置模板目录redis
    views: './views'
});
```

路由写法有些差异（koa用法不是本文重点，可以看koa文档）：

```js
app.get('/simple',function *(){
    yield this.render('simple',{title:'xtemplate'});
});
app.get('/index',function *(){
    yield this.render('index',{title:'xtemplate',content:'this is demo'});
});
```

调用this.render()来渲染模板。