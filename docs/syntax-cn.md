# XTemplate 模板语法
---

本文档是 XTemplate 支持的语法功能的一个整体简介。

## 变量

变量会从当前模板的上下文上查找值，如果你想输出一个变量的值，可以使用：

```
{{ username }}
```

这样模板引擎将会从上下文上去查找变量 `name` 然后打印出来。变量可以使用 `.` 来访问属性，和 javascript 一样，也可以用 `[]`。

```
{{ user.name }}
{{ user["name"] }}
```

和 javascript 一样，这两种方式的结果都是一样的。

如果一个变量的值是 `undefined` 或者 `null`，什么也不会被输出。同样的，如果引用了 `undefined` 或者 `null` 的属性，也不会输出任何值（也不会报错）。下面的这些操作当 `foo === undefined` 的时候，都不会输出任何值：`{{ foo }}`, `{{ foo.bar }}`, `{{ foo.bar.baz }}`。

### 支持的数据类型

XTemplate 支持 javascript 中所有的基本数据类型。

- `Boolean`
- `Number`
- `String`
- `null`
- `undefined`
- `Object`
- `Array`

### 输出

使用 `{{ foo }}` 来输出 `escape` 之后的数据, `{{{ foo }}}` 来输出 `unescape` 的原始数据。

```html
escaped: {{ foo }}
unescaped: {{{ foo }}}
```

使用数据 `{ foo: "<script>" }` 渲染这个模板，将会得到下面的结果：

```html
escaped: &lt;script&gt;
unescaped: <script>
```

如果你希望输出最原始的数据（包括 `{{}}`），你需要使用 `{{% %}}` 语法：

```
{{%

{{x}}

%}}
```

渲染这个模板，将会得到下面的结果：

```
{{x}}
```


如果想要给模板增加一些注释，请使用 `{{! comment }}`：


```
output before comment
{{! This is comment }}
output after comment
```

渲染这个模板，将会得到下面的结果：

```
output before comment

output after comment
```

### 作用域

每一个模板都有一个独立的作用域，在子模板中可以访问到父模板的上下文，但是在子模板中定义或者修改变量不会影响到父模板的变量。就像 javascript 中一样。

parent.xtpl:

```
{{ set (a = 1, b = 2) }}
{{include ("sub.xtpl") }}
in parent:
a = {{ a }}
b = {{ b }}
```

sub.xtpl:

```
in sub:
{{ set b = 3 }}
a = {{ a }}
b = {{ b }}
```

渲染 `parent.xtpl`，将会得到下面的结果：

```
in sub:
a: 1
b: 3
in parent:
a: 1
b: 2
```

### 根数据

通过 `root.foo` 可以放问到渲染的根数据（调用 `render` 方法时传递进去的数据）。

用数据 `{name: "foo", array: [{name: "bar"}]}` 渲染下面的模板:

```
{{#each(arr)}}
{{root.name}} {{name}}
{{/each}}
```

将会得到结果：

```
foo bar
```

## 方法和逻辑

你可以使用变量上 javascript 提供的方法：

```javascript
var x = [1, 2, 3];
```

```
{{#each(x.slice(1))}}{{this}} {{/each}} // => 2 3
```

### 操作符

XTemplate 支持在数据上使用一些操作符：

- 加: `+`
- 减: `-`
- 乘: `*`
- 除: `/`
- 余: `%`

例子:

```
{{x+y}}
{{x + "1"}}
{{ y - 1 }}
```

### 比较

- `===`
- `!==`
- `>`
- `>=`
- `<`
- `<=`

例子:

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

- `||`
- `&&`
- `!`

例子:

```
{{#if(x>1 && y<2)}}
{{/if}}

{{#if(!x)}}
{{/if}}
```

### 函数调用

如果你传递了 javascript 的方法到模板中，你可以像在 javascript 中一样使用它.

{{ foo(1, 2, 3) }}

### 内置函数

#### range(start, end, [step])

如果需要迭代一些固定的数字，`range` 可以很方便的生成一个数字集合给你。这些数字从 `start` 开始，然后按照 `step` (默认为1) 的数量进行递增或者递减，直到数字到达了 `stop`（不会包括 `stop`）。

```
{{#each(range(0,3))}}{{this}}{{/each}}
{{#each(range(3,0))}}{{this}}{{/each}}
{{#each(range(3,0,2))}}{{this}}{{/each}}
```

渲染这个模板，将会得到结果：

```
012
321
31
```

#### set(key=value, [key=value])

`set` 让你定义或者修改一个变量。

```
{{set(x=1)}}
{{set(y=3,z=2)}}
{{x}}
{{y+z}}
```
渲染这个模板，将会得到结果：

```
1
5
```

## 命令

命令是一些特殊的区块，对于这些特殊的区块，XTemplate 会做特殊的处理。XTemplate 自带了一些内置的命令，你也可以自己定义一些自己的命令。

### if

`if` 检查一个条件，让你可以选择性的输出内容，它和 javascript 中的 `if` 完全一致。

```
{{# if (variable) }}
    It is true
{{/ if }}
```

如果 `variable` 定义了且值为 true, 将会输出 `It is true`，否则什么都不会输出。

同样，可以通过 `elseif` 和 `else` 增加判断中的其他条件：

```
{{# if (hungry) }}
    I am hungry
{{ elseif (tired) }}
    I am tired
{{ else }}
    I am good!
{{/ if }}
```

### with

`with` 命令和 javascript 中的 `with` 类似：

```javascript
var a = {
    b: 1
}
```

```
{{#with(a)}}
{{b}} // 1
{{/with}}
```

### each

`each` 可以对 arrays 和 dictionaries 进行迭代：

#### arrays

```
{{set (array = [{
    name: "foo"
}, {
    name: "bar"
}])}}

{{#each(array)}}
    {{xindex}} {{this.name}}
{{/each}}
```

渲染这个模版，将会得到结果：

```
0 foo
1 bar
```

#### dictionaries

```
{{set (dictionary = {
    foo: "bar",
    hello: "world"
})}}

{{#each(dictionary,"value","key")}}
    {{key}} {{value}}
{{/each}}
```

渲染这个模版，将会得到结果：

```
foo bar
hello world
```

#### 访问上层变量

在 `with` 和 `each` 中，可以通过 `../` 来访问外层的同名变量.

```
{{#with(x)}}
    {{#each(b)}}
        {{../a}}{{a}} // 12
    {{/each}}
{{/with}}
```

使用数据 `{a: 1, b: [{a: 2}] }` 渲染上面的页面，将会得到结果：

```
12
```

### 宏

宏允许你定义一个可复用的代码片段，和 javascript 中的函数有点类似，下面是一个例子：

```
{{#macro("test","param", default=1)}}
    param is {{param}} {{default}}
{{/macro}}
```

Now you can call this macro like:

```
{{macro("test","2")}}
{{macro("test", "2", default=2)}}
```

渲染结果是：

```
param is 2 1
param is 2 2
```

注意: 在宏中，你不能访问外层作用域上的任何变量，但是仍然可以通过 `root` 来访问根数据。

### include

include 引入其他的模板。它在你想要共享不同的小的区块时非常有用。

```
{{ include ("item.html") }}
```

如果希望在引入子模版的时候同时在子模版的上下文上设置其他的值，可以通过 `include` 后面的参数传入。

在 `parent.html` 中：

```
{{ set (x = "x", y = "y") }}
{{ include ("sub.html", xx = x, yy = x)}}
```

在 `sub.html` 中：

```
x: {{x}}
y: {{y}}
xx: {{xx}}
yy: {{yy}}
```

渲染 `parent.html` 将会得到结果：

```
x: x
y: y
xx: x
yy: x
```

### parse

如果希望能够让子模版拥有一个完全独立的上下文，不需要父级作用域，则可以使用 `parse`。

在 `parent.html` 中：

```
{{ set (x = "x", y = "y") }}
{{ parse ("sub.html", xx = x, yy = x)}}
```

在 `sub.html` 中：

```
x: {{x}}
y: {{y}}
xx: {{xx}}
yy: {{yy}}
```

渲染 `parent.html` 将会得到结果：

```
x:
y:
xx: x
yy: x
```

## 模板继承

模板继承可以让你更容易的来复用模板。当编写一个 template 的时候，你可以定义 `blocks`，这样在子模板中可以重写掉这些 block。

如果有一个模板 `parent.xtpl`：

```html
<!doctype html>
<html>
    <head>
        <meta name="charset" content="utf-8" />
        <title>{{title}}</title>
        {{{block ("head")}}}
    </head>
    <body>
        {{{block ("body")}}}
    </body>
</html>
```

和一个子模板 `child.xtpl`:

```html
{{extend ("./parent")}}

{{#block ("head")}}
    <link type="text/css" href="test.css" rev="stylesheet" rel="stylesheet"/>
{{/block}}

{{#block ("body")}}
    <h2>{{title}}</h2>
{{/block}}
```
```

然后我们使用数据 `{title: 'XTemplate'}` 渲染 `child.xtpl`，将会得到下面的结果：

```html
<!doctype html>
<html>
    <head>
        <meta name="charset" content="utf-8" />
        <title>XTemplate</title>
        <link type="text/css" href="test.css" rev="stylesheet" rel="stylesheet"/>
    </head>
    <body>
        <h2>XTemplate</h2>
    </body>
</html>
```

## 保留关键词

- `debugger`
- `each`
- `extend`
- `include`
- `macro`
- `parse`
- `range`
- `set`
- `with`
