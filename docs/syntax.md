# XTemplate Syntax
---

This is an overview of the templating features available in XTemplate.

## Variables

A variable looks up a value from the template context. If you wanted to simply display a variable, you would do:

```
{{ username }}
```

This looks up `name` from the context and displays it. Variable names can have dots in them which lookup properties, just like javascript. You can also use the square bracket syntax.

```
{{ user.name }}
{{ user["name"] }}
```

These two forms to the exact same thing, just like javascript.

If a value is `undefined` or `null`, nothing is displayed. The same behavior occurs when referencing `undefined` or `null` objects. The following all output nothing if foo is undefined: `{{ foo }}`, `{{ foo.bar }}`, `{{ foo.bar.baz }}`.

### Support Data Types

XTemplate support all basic data types in javascript.

- `Boolean`
- `Number`
- `String`
- `null`
- `undefined`
- `Object`
- `Array`

### Display

Use `{{ foo }}` to display escaped data, and `{{{ foo }}}` to display original unescaped data.

```html
escaped: {{ foo }}
unescaped: {{ foo }}
```

Render this template with data `{ foo: "<script>" }`, the output will be:

```html
escaped: &lt;script&gt;
unescaped: <script>
```

If you want to display the original data (with `{{}}`), please use `{{%%}}`:

```
{{%

{{x}}

%}}  // => {{x}}
```

Render this template, the output will be:

```
{{x}}
```


To add some comments for your template, use `{{! comment }}`:


```
output before comment
{{! This is comment }}
output after comment
```

Render this template, the output will be empty.

```
output before comment

output after comment
```

### Scope

Every template has it's own independent scope. In sub template can visit parent's context, but define variables in sub template won't change parent's context.

In parent.xtpl:

```
{{ set (a = 1, b = 2) }}
{{include ("sub.xtpl") }}
in parent:
a = {{ a }}
b = {{ b }}
```

In sub.xtpl:

```
in sub:
{{ set b = 3 }}
a = {{ a }}
b = {{ b }}
```

Render `parent.xtpl`, the output will be:

```
in sub:
a: 1
b: 3
in parent:
a: 1
b: 2
```

### Root Data

Use `root.foo` can visit the data in root:

Render the follow template with data `{name: "foo", array: [name: "bar"]}`:

```
{{#each(arr)}}
{{root.name}} {{name}}
{{/each}}
```

The output will be:

```
foo bar
```

## Methods and Logics

You can call javascript's methods in variables.

```javascript
var x = [1, 2, 3];
```

```
{{#each(x.slice(1))}}{{this}} {{/each}} // => 2 3
```

### Operations

XTemplate allows you to operate on values. The following operators are available:

- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Division remainder: `%`

Examples:

```
{{x+y}}
{{x + "1"}}
{{ y - 1 }}
```

### Comparisons

- `===`
- `!==`
- `>`
- `>=`
- `<`
- `<=`

Examples:

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

### Logic

- `||`
- `&&`
- `!`

Examples:

```
{{#if(x>1 && y<2)}}
{{/if}}

{{#if(!x)}}
{{/if}}
```

### Function Calls

If you have passed a javascript method to your template, you can call it like normal.

{{ foo(1, 2, 3) }}

### Build in Functions

#### range(start, end, [step])

If you need to iterate over a fixed set of numbers, range generates the set for you. The numbers begin at start and incremeny by step (default 1) until it reaches stop, not including it.

```
{{#each(range(0,3))}}{{this}}{{/each}}
{{#each(range(3,0))}}{{this}}{{/each}}
{{#each(range(3,0,2))}}{{this}}{{/each}}
```

Render this template will output:

```
012
321
31
```

#### set(key=value, [key=value])

`set` lets you create/modify a variable.

```
{{set(x=1)}}
{{set(y=3,z=2)}}
{{x}}
{{y+z}}
```
Render this template will output:

```
1
5
```

## Commands

Commands are special blocks that perform operations on sections of the template. XTemplate comes with several builtin, but you can add your own.

### if

if tests a condition and lets you selectively display content. It behaves exactly as javascript's `if` behaves.

```
{{# if (variable) }}
    It is true
{{/ if }}
```

If variable is defined and evaluates to true, "It is true" will be displayed. Otherwise, nothing will be.

You can specify alternate conditions with elseif and else:

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

with command works like javascript's `with`:

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

`each` iterates over arrays and dictionaries.

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

Render this template, the output will be:

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

Render this template, the output will be:

```
foo bar
hello world
```

#### level access

In `with` and `each`, You can use `../` to visit outside variables.

```
{{#with(x)}}
    {{#each(b)}}
        {{../a}}{{a}} // 12
    {{/each}}
{{/with}}
```

Render this template with data `{a: 1, b: [{a: 2}] }`, the output will be:

```
12
```

### macro

macro allows you to define reusable chunks of content. It is similar to a function in a programming language. Here's an example:

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

The output will be:

```
param is 2 1
param is 2 2
```

Notice: In macro, you can't visit parent's scope, but you can visit root data through `root.key`.

### include

`include` pulls in other templates in place. It's useful when you need to share smaller chunks across several templates that already inherit other templates:

```
{{ include ("item.html") }}
```

If you want to pull in other templates and set more contexts, you can pass them by `include`'s arguments.

In `parent.html`:

```
{{ set (x = "x", y = "y") }}
{{ include ("sub.html", xx = x, yy = x)}}
```

In `sub.html`:

```
x: {{x}}
y: {{y}}
xx: {{xx}}
yy: {{yy}}
```

Render `parent.html`, the output will be:

```
x: x
y: y
xx: x
yy: x
```

### parse

If you want sub templates have an independent scope, please use `parse`.

In `parent.html`:

```
{{ set (x = "x", y = "y") }}
{{ parse ("sub.html", xx = x, yy = x)}}
```

In `sub.html` 中:

```
x: {{x}}
y: {{y}}
xx: {{xx}}
yy: {{yy}}
```

Render `parent.html`, the output will be:

```
x:
y:
xx: x
yy: x
```


## Template Inheritance

Template inheritance is a way to make it easy to reuse templates. When writing a template, you can define "blocks" that child templates can override. The inheritance chain can be as long as you like.

If we have a template parent.xtpl that looks like this:

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

And a template child.xtpl that looks like this:

```html
{{extend ("./parent")}}

{{#block ("head")}}
    <link type="text/css" href="test.css" rev="stylesheet" rel="stylesheet"/>
{{/block}}

{{#block ("body")}}
    <h2>{{title}}</h2>
{{/block}}
```

And we render child.xtpl with data: `{ title: "XTemplate" }`:

The output would be:

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

## Reserved words

- `debugger`
- `each`
- `extend`
- `include`
- `macro`
- `parse`
- `range`
- `set`
- `with`
