/* eslint-disable no-console */
import createObj from '.'

// https://juejin.cn/post/7057471253279408135
interface IUser { name: string, key: number, label: string }

// --------- 无泛型使用 ---------
const user = createObj({ name: 'Alice', age: 30 })
  .setName('Bob')
  .setAge(25)
console.log(user) // { name: 'Bob', age: 25 }

// --------- 有泛型 - 多必选 ---------
type User = SetOptional<IUser, 'name'>
// const forcedUser = createObj<User>({ key: 1 }).setName('Bob') // 开发时类型推断错误，因为缺少必选参数 label - 但是运行时还是无法保证
const forcedUser = createObj<User>({ key: 1, label: 'test' }).setName('Bob')
console.log(forcedUser) // { name: 'Bob', key: 1, label: 'test' }

// --------- 有泛型 - 单必选 ---------
type NewUser = SetOptional<User, 'label'>
const newUser1 = createObj<NewUser>({ key: 1 }).setName('Name1').setLabel('Label1') // 正常使用
console.log(newUser1) // { name: 'Name1', key: 1, label: 'Label1' }

// --------- 有泛型 - 单必选 - 构造方法直接传参 ---------
// const newUser2 = createObj<NewUser>(2) // 错误 - 单参数使用时，需要指定 key 值
// console.log(newUser2) // { name: 'test', key: 1 }
const newUser3 = createObj<NewUser>(3, 'key').setName('Name3').setLabel('Label3') // 单参数使用 - 需要指定 key 值，这是因为运行时是不知道值给哪个 key 的
console.log(newUser3) // { name: 'Name3', key: 3, label: 'Label3' }

// --------- 有泛型 - 无必选 ---------
const newUser4 = createObj<Partial<User>>({ key: 4 }).setName('Name4').setLabel('Label4') // 正常使用
console.log(newUser4) // { name: 'Name4', key: 4, label: 'Label4' }

const newUser5 = createObj<Partial<User>>({}).setKey(5).setName('Name5').setLabel('Label5') // 正常使用
console.log(newUser5) // { name: 'Name5', key: 5, label: 'Label5' }

const newUser6 = createObj<Partial<User>>().setName('Name6').setLabel('Label6') // 正常使用
console.log(newUser6) // { name: 'Name6', key: 6, label: 'Label6' }
