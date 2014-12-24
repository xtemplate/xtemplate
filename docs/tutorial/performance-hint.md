# performance hint
---

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