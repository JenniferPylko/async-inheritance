# async-inheritance

This module provides a class and the symbols necessary to create classes whose constructors return promises, while staying as close to JavaScript's normal class inheritance functionality as possible.

### Usage

The simplest async class looks like this:

```js
const { Async, constructor, Super } = require("async-inheritance")

class MyClass extends Async {
    async [constructor]() {
        await this[Super]()
        // async code
    }
}

(async () => {
    const instance = await new MyClass()
    console.log(instance instanceof MyClass) // true
})()
```

If you can't extend a function, simply wrap it:

```js
const { wrap } = require("async-inheritance")
const { EventEmitter } = require("events")

const WrappedClass = wrap(class extends EventEmitter {
    async [constructor]() {
        await asyncCode()
    }
})
```

Classes that extend Async can then be extended further:

```js
const { Async, constructor, Super } = require("async-inheritance")
const timers = require("timers/promises")

class MyClass1 extends Async {
    async [constructor](construction_delay) {
        await this[Super]()
        await timers.setTimeout(construction_delay)
    }
}

class MyClass2 extends MyClass1 {
    async [constructor]() {
        await this[Super](100)
        console.log("Finished constructor")
    }
}

(async () => {
    await new MyClass2()
})()
```

If a child class overrides \[\[constructor]] it _must_ call \[\[Super]], but the constructor can be omitted entirely with no issue:

```js
const { Async, constructor, Super } = require("async-inheritance")
const timers = require("timers/promises")

class MyClass1 extends Async {
    async [constructor](construction_delay) {
        await this[Super]()
        await timers.setTimeout(construction_delay)
    }
    do_something() {
        // do something
    }
}

class MyClass2 extends MyClass1 {
    do_something() {
        super.do_something()
        // do something more
    }
}

class MyClass3 extends MyClass2 {
    async [constructor]() {
        await this[Super](100)
        console.log("Finished constructor")
    }
}

(async () => {
    await new MyClass3()
})()
```

Just like with normal constructors, the async constructor can return an object:

```js
const { Async, constructor, Super } = require("async-inheritance")

class MyClass extends Async {
    async [constructor]() {
        await this[Super]()
        return {my_property: 1}
    }
}

(async () => {
    const instance = await new MyClass()
    console.log(instance.my_property === 1) // true
})()
```

### Notes

* Overriding the normal constructor will break the async constructor's functionality
* Acessing `this` before calling `await this[Super]()` may cause unexpected behavior (it does NOT throw an error the way that normal JavaScript class inheritance does)

### Compatibility

This module requires the following features:

* `Symbol`
* `Promise`
* classes
* `async`/`await`
* `const`
* rest/spread operator
* generator functions
* `Object.getPrototypeOf`
* `Object.getOwnPropertyNames`
* `Object.getOwnPropertySymbols`