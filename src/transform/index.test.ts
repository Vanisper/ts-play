import { describe, expect, expectTypeOf, it } from 'vitest'
import { transform } from '.'

describe('transform function', () => {
  // --- 测试不提供映射或映射为空的情况 ---
  describe('when no mapping is provided', () => {
    it('should return the original object if source is an object', () => {
      const source = { name: 'Alice', age: 30 }
      // 不传 mapping，应返回原始对象引用
      expect(transform(source)).toBe(source)
    })

    it('should return the original array if source is an array', () => {
      const source = [{ id: 1, value: 'A' }]
      // 不传 mapping，应返回原始数组引用
      expect(transform(source)).toBe(source)
    })

    it('should return a new equivalent object if mapping is an empty object', () => {
      const source = { name: 'Alice', age: 30 }
      const result = transform(source, {})
      // 传入空映射，会经过转换流程，返回一个新对象
      expect(result).not.toBe(source)
      expect(result).toEqual(source)
    })
  })

  // --- 测试转换单个对象 ---
  describe('when transforming a single object', () => {
    const source = {
      firstName: 'Bob',
      lastName: 'Smith',
      userAge: 42,
    }

    it('should rename all keys according to the mapping', () => {
      const mapping = { firstName: 'name', lastName: 'surname', userAge: 'age' } as const
      const result = transform(source, mapping)
      expect(result).toEqual({
        name: 'Bob',
        surname: 'Smith',
        age: 42,
      })
    })

    it('should rename only the specified keys and keep the others', () => {
      const mapping = { firstName: 'name', userAge: 'age' } as const
      const result = transform(source, mapping)
      expect(result).toEqual({
        name: 'Bob',
        lastName: 'Smith', // 未在 mapping 中，保持不变
        age: 42,
      })
    })

    it('should have the correct inferred type after transformation', () => {
      const localSource = { user_id: 1, user_name: 'Eve' }
      const mapping = { user_id: 'id' } as const
      const result = transform(localSource, mapping)

      // 运行时检查
      expect(result).toEqual({ id: 1, user_name: 'Eve' })

      // 类型层面检查 (Vitest 特有功能)
      expectTypeOf(result).toEqualTypeOf<{ id: number, user_name: string }>()
    })
  })

  // --- 测试转换对象数组 ---
  describe('when transforming an array of objects', () => {
    const source = [
      { user_id: 101, item: 'Book', price: 15 },
      { user_id: 102, item: 'Pen', price: 2, status: 'in_stock' },
    ]

    it('should rename keys for each object in the array', () => {
      const mapping = { user_id: 'userId', item: 'product' } as const
      const result = transform(source, mapping)
      expect(result).toEqual([
        { userId: 101, product: 'Book', price: 15 },
        { userId: 102, product: 'Pen', price: 2, status: 'in_stock' },
      ])
    })

    it('should return an empty array if the source is an empty array', () => {
      const source: any[] = []
      const mapping = { id: 'identifier' } as const
      expect(transform(source, mapping)).toEqual([])
    })

    it('should have the correct inferred array element type after transformation', () => {
      const localSource = [{ old_name: 'Frank', age: 40 }]
      const mapping = { old_name: 'newName' } as const
      const result = transform(localSource, mapping)

      // 运行时检查
      expect(result).toEqual([{ newName: 'Frank', age: 40 }])

      // 类型层面检查
      expectTypeOf(result).toEqualTypeOf<{ newName: string, age: number }[]>()
    })
  })
})
