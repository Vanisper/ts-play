/**
 * Pretty type
 */
type Pretty<T> = {
  [K in keyof T]: T[K]
}

/**
 * Mutable type
 * @link https://stackoverflow.com/questions/62038161/typescript-mutability-and-inversion-of-readonlyt
 */
type Mutable<T> = Pretty<{
  -readonly [K in keyof T]: T[K];
}>

type Arrayable<T> = T | T[]

/**
 * JSON 类型
 * @link https://stackoverflow.com/questions/61148466/typescript-type-that-matches-any-object-but-not-arrays
 */
interface IJson {
  [key: string]: Arrayable<string | number | boolean | IJson>
}

type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 判断类型 T 的所有属性是否都是可选的。
 * 如果是，则返回 true，否则返回 false。
 */
type AreAllPropertiesOptional<T extends object> = object extends T ? true : false

/**
 *
 * @link https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object
 */
type RequiredProps<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : object extends Pick<T, K> ? never : K]: T[K]
}

type GetOptionalProps<T> = { [K in keyof T as (undefined extends T[K] ? K : never)]: T[K] }
type GetRequiredProps<T> = { [K in keyof T as (undefined extends T[K] ? never : K)]: T[K] }

type RequiredLiteralKeys<T> = keyof { [K in keyof T as string extends K ? never : number extends K ? never :
    object extends Pick<T, K> ? never : K]: 0 }

type OptionalLiteralKeys<T> = keyof { [K in keyof T as string extends K ? never : number extends K ? never :
    object extends Pick<T, K> ? K : never]: 0 }

type IndexKeys<T> = string extends keyof T ? string : number extends keyof T ? number : never

/**
 * 获取对象类型 T 中所有必需属性的键名组成的联合类型。
 *
 * @example GetRequiredKeys<{ a: string; b?: number }> 会得到 "a"
 */
type GetRequiredKeys<TargetObject extends object> = RequiredLiteralKeys<TargetObject>

/**
 * 获取对象类型 T 中所有可选属性的键名组成的联合类型。
 *
 * @example GetOptionalKeys<{ a: string; b?: number }> 会得到 "b"
 */
type GetOptionalKeys<TargetObject extends object> = OptionalLiteralKeys<TargetObject>

/**
 * 将联合类型转换为交叉类型。
 *
 * @example UnionToIntersection<'a' | 'b'> 会得到 'a' & 'b' (对于字符串字面量是 never)
 * @example UnionToIntersection<'a'> 会得到 'a'
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

/**
 * 判断一个字符串类型 TestString 是否为单一的、特定的字符串字面量。
 *
 * @example IsActuallySingleStringLiteral<"name"> 为 true
 * @example IsActuallySingleStringLiteral<"name" | "age"> 为 false
 * @example IsActuallySingleStringLiteral<string> 为 false
 * @example IsActuallySingleStringLiteral<never> 为 false
 */
type IsActuallySingleStringLiteral<TestString extends string> =
      string extends TestString // 排除宽泛的 string 类型
        ? false
        : UnionToIntersection<TestString> extends never // 如果是 'a'|'b' 这种联合，UToI 会是 never
          ? false
          : true // 到这里，说明 TestString 是一个单一的字面量

/**
 * 分析 TargetObject，判断其是否符合“只有一个必需属性”的条件。
 * 如果是，则返回该属性的名称和类型；否则返回一个描述性字符串。
 */
type SingleRequiredPropMeta<TargetObject extends object> =
  GetRequiredKeys<TargetObject> extends infer RKS // RKS 是必需键的集合
    ? [RKS] extends [never] // 步骤1: 使用 [RKS] extends [never] 来避免分布，并检查是否没有必需键
        ? 'NoRequiredKeys'
      // 步骤2: 如果有必需键，则检查这些键的字符串部分是否构成一个单一字面量
        : IsActuallySingleStringLiteral<Extract<RKS, string>> extends true
        // Extract<RKS, string> 会提取 RKS 中的所有字符串类型成员。
        // 例如，如果 RKS = "name" | "age", Extract<RKS, string> 就是 "name" | "age"。
        // 如果 RKS = "name" | symbol, Extract<RKS, string> 就是 "name"。
        // 如果 RKS = symbol, Extract<RKS, string> 就是 never。
        // IsActuallySingleStringLiteral<never> 会返回 false。
          ? { name: Extract<RKS, string>, type: TargetObject[Extract<RKS, string & keyof TargetObject>] }
        // 步骤3: 如果不是单一特定的字符串字面量，则进一步判断原因
          : RKS extends string // 判断原始的 RKS 是否完全由字符串组成（可能是联合，或宽泛的 string）
            ? 'NotASingleSpecificRequiredKey' // 是，说明它是字符串联合或宽泛的 string
            : 'RequiredKeysNotStringBased' // 否，说明 RKS 包含非字符串类型（如 symbol）或仅为非字符串类型
    : never // 理论上不可达
