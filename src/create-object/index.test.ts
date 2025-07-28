import { describe, expect, it } from 'vitest'
import createObj from '.'

describe('createObj', () => {
  // https://juejin.cn/post/7057471253279408135
  // 定义一些测试用的接口
  interface User {
    name: string
    age: number
    email?: string
  }

  interface SingleRequired {
    id: string
    description?: string
  }

  interface AllOptional {
    host?: string
    port?: number
  }

  describe('overload 1: with a full object', () => {
    it('should create an object with initial values', () => {
      const initialUser: User = { name: 'Alice', age: 30 }
      const user = createObj(initialUser)

      expect(user.name).toBe('Alice')
      expect(user.age).toBe(30)
      expect(user.email).toBeUndefined()
    })

    it('should allow chaining set methods to update values', () => {
      const initialUser: User = { name: 'Alice', age: 30 }
      const user = createObj(initialUser)
        .setName('Bob')
        .setAge(42)
        .setEmail('bob@example.com')

      expect(user.name).toBe('Bob')
      expect(user.age).toBe(42)
      expect(user.email).toBe('bob@example.com')
    })

    it('should not mutate the original object', () => {
      const initialUser: User = { name: 'Alice', age: 30 }
      const user = createObj(initialUser)
      user.setName('Charlie')

      expect(initialUser.name).toBe('Alice') // 原始对象不应被改变
      expect(user.name).toBe('Charlie')
    })

    it('should work with an empty object', () => {
      const obj = createObj({})
      expect(obj).toEqual({})
    })
  })

  describe('overload 2: with a single required property value and key', () => {
    it('should create an object from a single required property', () => {
      const obj = createObj<SingleRequired>('user-123', 'id')
      expect(obj.id).toBe('user-123')
      expect(obj.description).toBeUndefined()
    })

    it('should allow chaining after creation', () => {
      const obj = createObj<SingleRequired>('user-123', 'id')
        .setDescription('A test user')

      expect(obj.id).toBe('user-123')
      expect(obj.description).toBe('A test user')
    })
  })

  describe('overload 3: with no arguments for all-optional types', () => {
    it('should create an empty object when no arguments are provided', () => {
      const config = createObj<AllOptional>()
      expect(config.host).toBeUndefined()
      expect(config.port).toBeUndefined()
    })

    it('should allow setting all properties through chaining', () => {
      const config = createObj<AllOptional>()
        .setHost('localhost')
        .setPort(8080)

      expect(config.host).toBe('localhost')
      expect(config.port).toBe(8080)
    })
  })

  describe('general functionality and edge cases', () => {
    it('should allow direct property assignment', () => {
      const user = createObj<User>({ name: 'Diana', age: 25 })
      user.age = 26
      user.email = 'diana@example.com'

      expect(user.age).toBe(26)
      expect(user.email).toBe('diana@example.com')
    })

    it('should return the proxy itself after a set call, allowing further chaining', () => {
      const user = createObj<User>({ name: 'Eve', age: 50 })
      const resultOfSet = user.setName('Frank')

      // resultOfSet 应该是 user proxy 本身
      expect(resultOfSet).toBe(user)
      resultOfSet.setAge(55)
      expect(user.name).toBe('Frank')
      expect(user.age).toBe(55)
    })

    it('should throw a runtime error for invalid argument combinations', () => {
      // 这种调用在 TS 中会报错，我们用 as any 来模拟 JS 环境或绕过类型检查的调用
      expect(() => (createObj as any)(123)).toThrow('Invalid createObj usage')
      expect(() => (createObj as any)('hello')).toThrow('Invalid createObj usage')

      // This will fail the `typeof secondArg === 'string'` check and throw.
      expect(() => (createObj as any)('value', 12345)).toThrow('Invalid createObj usage')
    })
  })
})
