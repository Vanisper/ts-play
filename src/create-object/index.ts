/**
 * 为对象 T 创建一个链式调用的类型。
 * 它结合了 T 的所有自身属性（可以直接访问）
 * 以及为每个属性生成的 `set` 方法，例如 `setName(value)`.
 */
type CreateObj<T extends object> = Required<{
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => CreateObj<T>;
}> & T

/**
 * 内部函数，使用 Proxy 实现链式调用。
 * @param initialObj - 初始状态的对象。
 * @returns 一个被 Proxy 包装的对象，支持链式调用。
 */
function createChainable<T extends object>(initialObj: T): CreateObj<T> {
  // 创建一个 initialObj 的浅拷贝，避免修改原始输入对象
  const targetObject = { ...initialObj }

  const handler: ProxyHandler<T> = {
    get(target, propKey, receiver) {
      const propName = String(propKey)

      // 动态拦截形如 `setXyz` 的方法调用。
      // 这是实现链式 setter 的核心。
      if (propName.startsWith('set') && propName.length > 3) {
        // 通过首字母大小写判断是否为我们期望的 set 调用，而非普通属性（如 "settings"）
        const firstCharAfterSet = propName.charAt(3)
        if (firstCharAfterSet === firstCharAfterSet.toUpperCase()) {
          // 将 `setName` 转换为 `name`
          const keyToSet = firstCharAfterSet.toLowerCase() + propName.slice(4)

          // 返回一个函数，该函数修改目标对象的属性
          return (value: any) => {
            (target as any)[keyToSet] = value
            // 关键：返回 Proxy 自身 (receiver)，以实现链式调用。
            // obj.setName('A').setAge(10)
            return receiver
          }
        }
      }

      // 对于非 set* 调用（例如直接访问 `obj.name`），正常返回目标对象的属性值。
      return Reflect.get(target, propKey, receiver)
    },
    // 我们也允许直接赋值 `obj.name = 'new name'`
    set(target, propKey, value, receiver) {
      return Reflect.set(target, propKey, value, receiver)
    },
  }

  return new Proxy(targetObject, handler) as CreateObj<T>
}

/**
 * 重载 1: 接受一个完整的对象作为初始值。
 * @example createObj({ name: 'Alice', age: 30 })
 */
export function createObj<T extends object>(
  value: T
): CreateObj<T>

/**
 * 重载 2: 当泛型 T 只有一个必需属性时，可只传入该属性的值和键名。
 * @example
 * interface User { name: string; age?: number; }
 * createObj<User>('Bob', 'name')
 */
export function createObj<
  T extends object,
  Meta = SingleRequiredPropMeta<T>,
>(
  value: Meta extends { type: infer VT } ? VT : never,
  key: Meta extends { name: infer K extends keyof T } ? K : never,
): CreateObj<T>

/**
 * 重载 3: 当泛型 T 的所有属性都可选时，允许无参数调用。
 * @example
 * interface Config { host?: string; port?: number; }
 * createObj<Config>()
 */
export function createObj<T extends object>(
  ...args: AreAllPropertiesOptional<T> extends true ? [] : [never]
): CreateObj<T>

/**
 * createObj 函数的实现。
 * 它根据传入参数的数量和类型，分派到不同的创建逻辑，
 * 最终都调用 `createChainable` 来返回一个支持链式调用的对象。
 */
export function createObj<T extends object>(...args: any[]): CreateObj<T> {
  const argsLength = args.length

  // 匹配重载 3: 无参数调用 (e.g., createObj<Config>())
  if (argsLength === 0) {
    // 此时 TypeScript 已在编译时确保 T 的所有属性是可选的
    return createChainable({} as T)
  }

  const firstArg = args[0]
  const secondArg = args[1]

  // 匹配重载 2: 单一值 + 键名 (e.g., createObj<User>('Bob', 'name'))
  if (argsLength === 2 && typeof secondArg === 'string') {
    const constructedObj = { [secondArg]: firstArg } as T
    return createChainable(constructedObj)
  }

  // 匹配重载 1: 完整对象 (e.g., createObj({ name: 'Alice' }))
  if (argsLength === 1 && typeof firstArg === 'object' && firstArg !== null) {
    return createChainable(firstArg as T)
  }

  // 如果参数不匹配任何重载（这在正常 TS 环境下会被编译器阻止），
  // 则在运行时抛出错误，以防 ts-ignore 或纯 JS 调用。
  throw new Error(
    'Invalid createObj usage: Arguments did not match any valid signature.',
  )
}

export default createObj
