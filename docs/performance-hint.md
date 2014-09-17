# performance hint

### variable render hint

#### top variable is fast by default

```javascript
{
  d1:1,
  d2:2,
  d3:3
}
```

```
{{d1}}{{d2}}{{d3}}
```

#### this is faster than without this

```javascript
{
  arr: [{v:1},{v:2},{v:3},{v:4}]
}
```

slower:
```javascript
{{#each(arr)}}
{{v}}
{{/each}}
```

faster:
```javascript
{{#each(arr)}}
{{this.v}}
{{/each}}
```

#### root is faster in block

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