# hints
---

## ignore function call result

```js
{{set(n=[])}}
{{n.push(2)}} // => 1
{{n.push(4 && undefined)}} // =>
```

## modify reference

```js
{{set(n=['x'])}}
{{set(str='x')}}
{{set(data=[1,2,3])}}
{{#each(data)}}
  {{set(str = str+this)}}
  {{n.push(this) && undefined}}
{{/each}}

{{str}} // => x
{{n.join('')}} //=> x123
```

## performance hint

### variable render hint

#### this is faster than without this (avoid scope chain)

```javascript
{
  top: 'top',
  arr: [{v:1},{v:2},{v:3},{v:4}]
}
```

slower:
```javascript
{{top}}
{{#each(arr)}}
{{v}}
{{/each}}
```

faster:
```javascript
{{this.top}}
{{#each(arr)}}
{{this.v}}
{{/each}}
```

#### root is faster in block (avoid scope chain)

```javascript
{
  title: 't',
  arr: [{v:1},{v:2},{v:3},{v:4}]
}
```

slower:
```javascript
{{#each(arr)}}
{{v}}{{title}}
{{/each}}
```

faster:
```javascript
{{#each(arr)}}
{{v}}{{root.title}}
{{/each}}
```