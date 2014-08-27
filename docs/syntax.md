# XTemplate Syntax

## data type

### true

### false

### null

### undefined

### number

### string

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

## escape

### {{%%}}

```
{{%

{{x}}

%}}  // => {{x}}
```

###  \\{{

```
\{{a}}  // -> {{a}}
```

### angularjs conflict

[http://stackoverflow.com/questions/13671701/angularjs-twig-conflict-with-double-curly-braces](http://stackoverflow.com/questions/13671701/angularjs-twig-conflict-with-double-curly-braces)

## comment


```
{{! zhu shi }}
```

## variable

escaped：

```
{{x}}
```

unescaped:

```
{{{x}}}
```

## root data

```javascript
var x = {name:1,arr:[{name:2}]}
```

```
{{#each(arr)}}
{{root.name}}{{name}} {{! 12 }}
{{/each}}
```

## property access


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

## data method

```javascript
var x = [1, 2, 3];
```

```
{{#each(x.slice(1))}}{{this}} {{/each}} // => 2 3
```

## operation

+ - * / %

```
{{x+y}}
{{x + "1"}}
{{ y - 1 }}
```

## comparison

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

## logic

|| &&

```
{{#if(x>1 && y<2)}}
{{/if}}
```

```
{{#if(!x)}}
{{/if}}
```

## loop

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

## range

```
{{#each(range(0,3))}}{{this}}{{/each}} // 012
{{#each(range(3,0))}}{{this}}{{/each}} // 321
{{#each(range(3,0,2))}}{{this}}{{/each}} // 31
```

## set

```
{{set(x=1)}}
{{set(y=3,z=2)}}
{{x}} // 1
{{y+z}} // 5
```

## macro

```
// declare
{{#macro("test","param" default=1)}}param is {{param}} {{default}}{{/macro}}

// call
{{macro("test","2")}} // => param is 2 1

{{macro("test", "2", 2)}} // => param is 2 2
```

## include

x.xtpl

```
{{z}}
```

y.xtpl

```
{{include("x")}}
```

## extend

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