export interface AsyncConstructable<T> extends T {
  new (...args: ConstructorParameters<T>): Promise<T>
}

export interface AsyncClass {
  new (...args: any[]): Promise<this>
}

export type wrap = <T>(_class: T) => AsyncConstructable<T>
