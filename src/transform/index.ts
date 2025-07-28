type TransformMap<S> =
  S extends (infer U)[]
    ? Partial<Record<keyof U, string>>
    : S extends object ?
      Partial<Record<keyof S, string>>
      : never

type Transformed<S, M extends TransformMap<S>> =
  S extends (infer U)[]
    ? { [K in keyof U as K extends keyof M ? M[K] extends string ? M[K] : K : K]: U[K] }[]
    : S extends object
      ? { [K in keyof S as K extends keyof M ? M[K] extends string ? M[K] : K : K]: S[K] }
      : never

export function transform<S, M extends TransformMap<S>>(
  source: S,
  mapping?: M,
) {
    type ReturnType = Transformed<S, M>
    if (!mapping) {
      return source as ReturnType
    }
    if (Array.isArray(source)) {
      return source.map(item => transformObject(item, mapping)) as ReturnType
    }
    return transformObject(source, mapping) as ReturnType
}

function transformObject<T>(obj: T, mapping?: Partial<Record<keyof T, string>>) {
  if (!mapping) {
    return obj
  }

  const result: Record<string, any> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = mapping[key] || key
      result[newKey] = obj[key]
    }
  }
  return result
}

export default transform
