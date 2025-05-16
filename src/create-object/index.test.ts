/* eslint-disable no-console */
import createObj from '.'

// --------- 无泛型使用 ---------
const user = createObj({ name: 'Alice', age: 30 })
  .setName('Bob')
  .setAge(25)
console.log(user) // { name: 'Bob', age: 25 }

// --------- 有泛型 - 多必选 ---------
interface User { name?: string, key: number, label: string }
const forcedUser = createObj<User>({ key: 1, label: 'test' }).setName('Bob')
console.log(forcedUser) // { name: 'Bob', key: 1, label: 'test' }

// --------- 有泛型 - 单必选 ---------
type NewUser = SetOptional<User, 'label'>
const newUser1 = createObj<NewUser>({ key: 1 }).setName('Name1').setLabel('Label1') // 正常使用
console.log(newUser1) // { name: 'Name1', key: 1, label: 'Label1' }

// --------- 有泛型 - 单必选 - 构造方法直接传参 ---------
// const newUser2 = createObj<NewUser>(2) // 错误 - 单参数使用时，需要指定 force 相关配置
// console.log(newUser2) // { name: 'test', key: 1 }
const newUser3 = createObj<NewUser>(3, 'key').setName('Name3').setLabel('Label3') // 单参数使用 - 需要指定 key 值，这是因为运行时是不知道值给那个 key 的
console.log(newUser3) // { name: 'Name3', key: 3, label: 'Label3' }
