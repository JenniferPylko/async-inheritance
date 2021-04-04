const gen_prototypes = function*(instance) {
    let proto = instance
    do {
        yield proto
    } while (proto = Object.getPrototypeOf(proto))
}

const inheritance = Symbol("inheritance tracker")

const async_constructor = Symbol("async constructor")
const async_super = Symbol("async super")

class AsyncClass {
    constructor (...args) {
        if (this[async_super] !== AsyncClass.prototype[async_super]) {
            throw new ReferenceError("AsyncClass[[async super]] cannot be overriden")
        }
        return new Promise(async (resolve) => {
            this[inheritance] = Object.getPrototypeOf(this)
            const bound_constructor = this[inheritance].hasOwnProperty(async_constructor)
                ? this[async_constructor].bind(this)
                : AsyncClass.prototype[async_constructor].bind(this)
            delete this[async_constructor]
            const override = await bound_constructor(...args)
            if (typeof this[inheritance] !== "undefined" && this[inheritance] !== null && typeof this[inheritance][async_constructor] !== "undefined") {
                throw new ReferenceError("this[[async super]]() must be called by this[[async constructor]]()")
            }
            delete this[async_super]
            delete this[inheritance]
            resolve(typeof override !== "undefined" ? override : this)
        })
    }

    async [async_constructor](...args) {
        await this[async_super](...args)
    }

    async [async_super](...args) {
        this[inheritance] = Object.getPrototypeOf(this[inheritance])
        if (typeof this[inheritance] !== "undefined" && this[inheritance] !== null && typeof this[inheritance][async_constructor] !== "undefined") {
            if (this[inheritance].hasOwnProperty(async_constructor)) {
                const override = await this[inheritance][async_constructor].bind(this)(...args)
                if (typeof override !== "undefined") {
                    for (const proto of Array.from(gen_prototypes(this))) {
                        for (const key of Object.getOwnPropertyNames(proto)) {
                            delete this[key]
                        }
                        for (const key of Object.getOwnPropertySymbols(proto)) {
                            if (key !== async_constructor && key !== async_super && key !== inheritance) {
                                delete this[key]
                            }
                        }
                    }
                    Object.setPrototypeOf(this, Object.getPrototypeOf(override))
                    Object.assign(this, override)
                }
            } else {
                await AsyncClass.prototype[async_constructor].bind(this)(...args)
            }
        }
    }
}

module.exports = {AsyncClass, async_constructor, async_super}