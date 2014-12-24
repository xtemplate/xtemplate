# xtemplate on kg
---

By minghe36@126.com

本文提到的xtemplate不是KISSY1.4.X内置的xtemplate模块，而是kissy gallery中的xtemplate模块，即kg/xtemplate，这是承玉将xtemplate剥离出kissy后，针对kissy的版本，由于相对于1.4.X的xtemplate模块变动太多，建议看成全新的模板引擎来看待。

有看过KISSY5文档的同学，会发现xtemplate模块没有了，模板需要使用kg/xtemplate。

而 kg/xtemplate 不是只支持KISSY5，KISSY1.4.X也是可以使用的，所以建议大家使用 kg/xtemplate 代替原来xtemplate，方便日后升级KISSY5，同时 kg/xtemplate 性能更强，语法更强大易用。

xtemplate（新）也支持作为服务器端模板引擎（比如Node.js ，支持express和koa，下一篇会讲解）。

##  如何使用 kg/xtemplate

[《kg/xtemplate 文档》](http://gallery.kissyui.com/xtemplate/doc/guide/index.html) 。

KISSY1.4.X使用的是3.3.3版本的xtemplate，带KISSY.add()包裹，3.3.3以上的版本是KISSY5使用的，带modulex.add()，比如3.4.1。

来看一个简单的demo：http://jsfiddle.net/minghe36/8g4crh71/。

模板未编译的情况下，需要使用 kg/xtemplate/3.3.3/index ，如果模板已经编译，直接使用xtemplate的渲染器runtime.js。

初看demo，貌似跟旧的xtemplate模块并没有分别，别急后面会有一篇专门讲解xtemplate的语法。

## 编译模板
严重建议模板编译后再使用，对性能有非常大的帮助。

编译器模块为xtemplate，kissy1.4.x请使用3.3.3的版本：

package.json

```js
"devDependencies": {
    "xtemplate": "3.3.3"
}
```

（需要留意xtemplate版本的一致性。）

如果你使用gulp构建（建议使用），请使用gulp插件：gulp-xtemplate。

gulpfile.js的写法参考 bee：
```js
var XTemplate = require('xtemplate');
var gulpXTemplate = require('gulp-xtemplate');
var src = "./src";
gulp.task('xtpl',function(){
    return gulp.src(src+'/**/*.xtpl')
        .pipe(gulpXTemplate({
            wrap: 'kissy',
            XTemplate: XTemplate
        }))
        .on('error',function(e){
            console.log(e);
        })
        .pipe(gulp.dest(src));
});
```
xtpl 任务会构建src目录下所有.xtpl文件，所以xtemplate模板文件必须是xtpl后缀。

wrap: 'kissy' 会给编译后的模块js文件加上KISSY.add() 包裹，如果是KISSY5的代码，不用传参。

wrap: 'none' 将不带任何包裹函数。

任务运行后，会生成2个文件，参考 bee
，content.xtpl生成 content.js 和content-render.js，content.js是编译后模板模块，而content-render.js是快速渲染模板的门面方法。

请看 [demo](http://jsfiddle.net/minghe36/0onzL1La/)，只需要使用门面方法渲染模板：
```js
//使用模块
KISSY.use('bee-demo/mods/content-render,node',function(S,contentRender,Node){
    var html = contentRender({
        title:'this is article',
        content:'render by kg/xtemplate'
    });
    Node.all('body').html(html);
})
```
当然render不是必须的，你也可以自己new XTemplate()实例，比如。
```js
KISSY.use('bee-demo/mods/content,kg/xtemplate/3.3.3/runtime,node',function(S,contentXtpl,XTemplate,Node){
    var html = new XTemplate(contentXtpl).render({
        title:'this is article',
        content:'render by kg/xtemplate'
    });
    Node.all('body').html(html);
})
```
这样使用更自由些。

下一篇我们讨论 xtemplate 在服务器端的使用~