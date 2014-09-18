# performance hint

### variable render hint

#### this is faster than without this

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
{{this.top}}
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