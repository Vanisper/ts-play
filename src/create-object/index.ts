type CreateObj<T extends object> = Required<{
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => CreateObj<T>;
}> & T

function createChainable<T extends object>(initialObj: T): CreateObj<T> {
  // 确保我们操作的是一个对象，并且是 initialObj 的副本
  const targetObject = (typeof initialObj === 'object' && initialObj !== null)
    ? { ...initialObj }
    : {} as T

  const handler: ProxyHandler<T> = {
    get: (target, propKey: string | symbol, receiver) => {
      const propName = String(propKey)

      // 动态处理 setXyz 调用
      if (propName.startsWith('set') && propName.length > 3) {
        const firstCharAfterSet = propName.charAt(3)
        // 确保是 setK (首字母大写) 而非普通属性如 "settings"
        if (firstCharAfterSet === firstCharAfterSet.toUpperCase()) {
          const keyToSet = firstCharAfterSet.toLowerCase() + propName.slice(4)
          return (paramValue: any) => {
            (target as any)[keyToSet] = paramValue
            return receiver // 返回代理自身以支持链式调用
          }
        }
      }
      // 其他属性正常获取
      return Reflect.get(target, propKey, receiver)
    },
    set: (target, propKey: string | symbol, value, receiver) => {
      // 允许直接设置属性，符合 CreateObj<T> 定义中的 `& T` 部分
      return Reflect.set(target, propKey, value, receiver)
    },
    // 可以按需添加其他 Proxy 陷阱如 has, ownKeys 等
  }

  return new Proxy(targetObject, handler) as CreateObj<T>
}

function createObj<
  T extends object,
  Meta = SingleRequiredPropMeta<T>,
>(
  value: Meta extends { name: keyof T, type: infer VT } ? VT : T,
  options?: GetRequiredKeys<T>,
): CreateObj<T>
function createObj<T extends object>(value: T): CreateObj<T>
function createObj<T extends object>(
  ...args: AreAllPropertiesOptional<T> extends true ? [] : [never]
): AreAllPropertiesOptional<T> extends true ? CreateObj<T> : never

function createObj<T extends object>(...args: any[]): CreateObj<T> { // 实现的返回类型应该是 CreateObj<T> 或在错误路径抛出
  const argsLength = args.length

  // --- 处理无参数调用重载 (当 T 的所有属性可选时) ---
  if (argsLength === 0) {
    // 编译时，类型系统应已通过 AreAllPropertiesOptional<T> 确保 T 适合无参数调用。
    // 运行时，信任这个编译时检查。
    return createChainable({} as T)
  }

  // --- 处理带参数的调用 ---
  // 假设参数最多为两个：第一个是 value (可能是 VT 或 T)，第二个是 options
  const firstArg = args[0]
  const options = (argsLength > 1 ? args[1] : undefined) as keyof T | undefined

  if (options && typeof options === 'string') {
    // 如果 options 存在(即Meta找到了K)，则使用它；否则(Meta没找到K，没有options)，使用默认 "__key__"
    const keyToUse = options ?? '__key__' // 当然，当前不会出现这个问题（没有传递会直接报错），但还是保留了兜底逻辑
    const forcedObj = { [keyToUse]: firstArg } as T
    return createChainable(forcedObj)
  }

  if (typeof firstArg === 'object' && firstArg !== null) {
    return createChainable({ ...firstArg } as T) // 使用对象副本
  }

  throw new Error(
    'Invalid createObj usage: A unknown argument was provided without `options: string` (keyof T), '
    + 'or the call signature did not match any productive overload.',
  )
}

export { createObj }
export default createObj
