const genPrototypes = function * (instance) {
  let proto = instance
  do {
    yield proto
  } while (proto = Object.getPrototypeOf(proto))
}

const inheritance = Symbol('inheritanceTracker')

const constructor = Symbol('asyncConstructor')
const asyncSuper = Symbol('asyncSuper')

/**
 * @type {import('./typedef.d.ts').AsyncClass}
 */
class Async {
  constructor (...args) {
    if (this[asyncSuper] !== Async.prototype[asyncSuper]) {
      throw new ReferenceError('AsyncClass[[asyncSuper]] cannot be overriden')
    }
    return new Promise(async (resolve) => {
      this[inheritance] = Object.getPrototypeOf(this)
      const boundConstructor = this[inheritance].hasOwnProperty(constructor)
        ? this[constructor].bind(this)
        : Async.prototype[constructor].bind(this)
      delete this[constructor]
      const override = await boundConstructor(...args)
      if (typeof this[inheritance] !== 'undefined' && this[inheritance] !== null && typeof this[inheritance][constructor] !== 'undefined') {
        throw new ReferenceError('this[[asyncSuper]]() must be called by this[[async constructor]]()')
      }
      delete this[asyncSuper]
      delete this[inheritance]
      resolve(typeof override !== 'undefined' ? override : this)
    })
  }

  async [constructor] (...args) {
    await this[asyncSuper](...args)
  }

  async [asyncSuper] (...args) {
    this[inheritance] = Object.getPrototypeOf(this[inheritance])
    if (typeof this[inheritance] !== 'undefined' && this[inheritance] !== null && typeof this[inheritance][constructor] !== 'undefined') {
      if (this[inheritance].hasOwnProperty(constructor)) {
        const override = await this[inheritance][constructor].bind(this)(...args)
        if (typeof override !== 'undefined') {
          for (const proto of Array.from(genPrototypes(this))) {
            for (const key of Object.getOwnPropertyNames(proto)) {
              delete this[key]
            }
            for (const key of Object.getOwnPropertySymbols(proto)) {
              if (key !== constructor && key !== asyncSuper && key !== inheritance) {
                delete this[key]
              }
            }
          }
          Object.setPrototypeOf(this, Object.getPrototypeOf(override))
          Object.assign(this, override)
        }
      } else {
        await Async.prototype[constructor].bind(this)(...args)
      }
    }
  }
}

/**
 * @type {import('./typedef.d.ts').wrap}
 */
function wrap (_class) {
  // @ts-ignore
  return new Proxy(_class, {
    construct: (Module, argumentsList) => {
      const instance = new Module(...argumentsList)
      return instance[constructor](...argumentsList)
    }
  })
}

module.exports = { Async, constructor, Super: asyncSuper, wrap }
