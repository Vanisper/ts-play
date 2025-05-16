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

/**
 * 重载 1: 接受完整对象 T 的调用。
 * 这是最通用的形式
 */
function createObj<T extends object>(
  value: T
): CreateObj<T>

/**
 * 重载 2: 单一必需属性值 (VT) + 其特定的属性键名 (K) 调用。
 * 仅当 T 只有一个必需属性时匹配。
 * value 是该属性的值，key 是该属性的名称。
 */
function createObj<
  T extends object,
  Meta = SingleRequiredPropMeta<T>,
>(
  value: Meta extends { type: infer VT } ? VT : never,
  key: Meta extends { name: infer K extends keyof T } ? K : never,
): CreateObj<T>

/**
 * 重载 3: 无参数调用。
 * 仅当 T 的所有属性都为可选时匹配。T 必须由调用者显式提供。
 */
function createObj<T extends object>(
  ...args: AreAllPropertiesOptional<T> extends true ? [] : [never]
): CreateObj<T>

function createObj<T extends object>(...args: any[]): CreateObj<T> {
  const argsLength = args.length

  // 对应重载 3: 无参数调用
  if (argsLength === 0) {
    // 编译时已确保 T 的所有属性可选
    return createChainable({} as T)
  }

  const firstArg = args[0]
  const secondArg = args[1]

  // 对应重载 2: 单一必需属性值 (VT) + 其特定的属性键名 (K)
  if (argsLength === 2 && typeof secondArg === 'string') {
    const constructedObj = { [secondArg]: firstArg } as T
    return createChainable(constructedObj)
  }

  // 对应重载 1: 接受完整对象 T (此时 argsLength === 1)
  if (argsLength === 1 && typeof firstArg === 'object' && firstArg !== null) {
    return createChainable({ ...firstArg } as T) // 使用对象副本
  }

  // 如果以上情况都不匹配（例如，argsLength === 1 但 firstArg 不是对象，
  // 这意味着尝试了单属性值模式但没有提供 key），则视为无效用法。
  // 这种情况在编译时应已被类型系统捕获（因为不匹配任何有效重载）。
  throw new Error(
    'Invalid createObj usage: Arguments did not match any valid signature. '
    + 'If providing a single non-object value for a required property, its key must be provided as the second argument.',
  )
}

export { createObj }
export default createObj
