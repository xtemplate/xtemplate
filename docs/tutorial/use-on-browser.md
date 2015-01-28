# use XTemplate on browser
---

[xtemplate](https://github.com/xtemplate/xtemplate) 经过独立化而摆脱了对 kissy 的依赖，从而可以在 kissy 升级时仍然使用老的 xtemplate，或者单独升级 xtemplate，本文介绍浏览器端单独使用 xtemplate 的几种方案

## 依赖库与工具

* [gulp](https://github.com/gulpjs/gulp/) 项目构建工具
* [xtemplate](https://github.com/xtemplate/xtemplate) 应用于 nodejs 构建工具以及浏览器端的模板引擎库
* [gulp-xtemplate](https://github.com/xtemplate/gulp-xtemplate) 将指定后缀的模板文件（默认 .xtpl）编译为可加载的模块.
* [modulex](https://github.com/modulex/modulex) 下一代独立的模块加载器
* [requirejs](https://github.com/jrburke/requirejs) 流行的模块加载器

## 浏览器端使用

xtemplate 以及其依赖的浏览器端库可通过 [bower](https://github.com/bower/bower) 安装

### standalone 模式

最简单的情况可以直接静态 xtemplate 库到页面中，直接提供模板字符串渲染即可，例如：

```html
<script src="../bower_components/xtemplate/build/xtemplate-standalone-debug.js"></script>
<script>
    console.log(new XTemplate('{{x}}{{y}}').render({
        x: 1,
        y: 2
    }))
</script>
```

上述例子浏览器会直接打印 12.

### 模块加载模式

#### modulex loader

standalone 模式需要浏览器端在线编译，并且不能有效处理（需要另行配置）模板 include/extend 的情景，而通过把模板编译为模板函数模块，则可以利用现有的模块加载引擎以及打包机制来处理模版的依赖，并且避免了浏览器端的编译

首先准备 .xtpl 模板文件，例如

xtpl/a.xtpl
```
{{x}}{{include('./b')}}
```

xtpl/b.xtpl
```
{{y}}
```

然后通过 gulp-xtemplate 将其编译为模板函数模块, gulpfile:
```
var gulpXTemplate = require('gulp-xtemplate');
var gulp = require('gulp');
var xtemplate = require('xtemplate');
gulp.task('default', function () {
    gulp.src('xtpl/**/*').pipe(gulpXTemplate({
        XTemplate: xtemplate,
        runtime: 'xtemplate/runtime'
    })).pipe(gulp.dest('build'))
});
```

这里需要保证 npm install 的 xtemplate 和 bower install 的 xtemplate 是同一个版本.例如

```
npm install xtemplate@1.2.4
bower install xtemplate#1.2.4
```

接下来使用 modulex 加载并配置模板引擎包使用即可：
```
<script src="../bower_components/modulex/build/modulex-debug.js"></script>
<script>
    modulex.config({
        packages: {
            xtemplate: {
                filter: 'debug',
                base: '../bower_components/xtemplate/build/xtemplate'
            },
            xtpl: {
                base: './build'
            }
        }
    });
    modulex.use('xtpl/a-render', function (aRender) {
        console.log(aRender({
            x: 1,
            y: 2
        }));
    }); // 12
</script>
```

#### requirejs loader

同 modulex 类似，也可以使用 requirejs 加载 xtemplate 的模板，如果不想重新构建 xtemplate 的话这里需要做下适配：

```javascript
var modulex = {
        add: function (name, deps, fn) {
            if (arguments.length === 3) {
                deps.unshift.apply(deps, ['require', 'exports', 'module']);
                define(name, deps, fn);
            } else {
                define(name, deps, fn);
            }
        }
    };
```

接下来对构建脚本做下配置为生成 define 包装：

```javascript
    gulp.src('xtpl/**/*').pipe(gulpXTemplate({
        XTemplate: xtemplate,
        wrap: 'define',
        runtime: 'xtemplate/runtime'
    })).pipe(gulp.dest('build'))
```

最后就可以使用了：

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.14/require.js"></script>
<script>
    var modulex = {
        add: function (name, deps, fn) {
            if (arguments.length === 3) {
                deps.unshift.apply(deps, ['require', 'exports', 'module']);
                define(name, deps, fn);
            } else {
                define(name, deps, fn);
            }
        }
    };
    require.config({
        paths: {
            xtpl: './build',
            'xtemplate/runtime': '../bower_components/xtemplate/build/xtemplate/runtime-debug'
        }
    });
    require(['xtpl/a-render'], function (aRender) {
       aRender({
            x: 1,
            y: 2
        },function(err,content){
            console.log(content);
        });
    });
</script>
```

上述例子详见: [xtemplate-on-browser](https://github.com/yiminghe/xtemplate-on-browser)

## 建议

欢迎提建议到：https://github.com/xtemplate/xtemplate/issues/new
