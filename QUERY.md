# Query Specification

## Selectors

### Undefined & null Selectors
```js
{
    selector: undefined|null
}
```

### Primitive Selector
```js
{
    // selector is a non-null primitive (and not an array or RegExp either)
    selector: String|Number
}
```

### Array Selector
```js
{
    // Arrays match either identical arrays or arrays that contain it as a
    // value.
    selector: Array
}
```

### Object Selector
```js
{
    // It's an object, but not an array or regexp
    selector: Object
}
```

### Literal Selector
```js
{
    // It's a literal; compare value (or element of value array) directly to // the selector
    selector: literal 
}
```

## Runner
- [x] `exec`
- [x] `then`
- [x] `callback`

## Collective Logical Operators
- [ ] `and / $and`
- [ ] `or / $or`
- [ ] `nor / $nor`

## Logical Value Operators
- [ ] `eq / equals / $eq`
- [ ] `neq / $ne / $neq`
- [ ] `gt / $gt`
- [ ] `gte / $gte`
- [ ] `lt / $lt`
- [ ] `lte / $lte`
- [ ] `match / $match`
- [ ] `elementMatch / $elementMatch / $elemMatch`
- [ ] `in / $in`
- [ ] `nin / $nin`
- [ ] `mod / $mod`
- [ ] `regex / $regex`
- [ ] `not / $not`

## Find
- [ ] `where`
- [ ] `sort`
- [ ] `skip`
- [ ] `limit`
- [ ] `gt`
- [ ] `gte`
- [ ] `lt`
- [ ] `lte`
- [ ] `eq` / `equals`
- [ ] `ne`
- [ ] `select`
- [ ] `distinct`
- [ ] `exists`
- [ ] `find`
- [ ] `findById`
- [ ] `findByIdAndRemove`
- [ ] `findByIdAndUpdate`
- [ ] `findOne`
- [ ] `findOneAnRemove`
- [ ] `findOneAndUpdate`
- [ ] `in`
- [ ] `nin`
- [ ] `or`
- [ ] `nor`
- [ ] `and`
- [ ] `map`
- [ ] `reduce`

## Aggregate
- [ ] `count`
- [ ] `sum`
- [ ] `average`
- [ ] `min`
- [ ] `max`
- [ ] `incr`
- [ ] `increment`
- [ ] `decr`
- [ ] `decrement`

## Create
- [ ] `save`
- [ ] `create`

## Update
- [ ] `update`
- [ ] `upsert`

## Delete
- [ ] `remove`
- [ ] `delete`