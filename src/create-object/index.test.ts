/* eslint-disable no-console */
// ❗ 所有的整项传值在运行时都是不安全的 - 但是开发阶段的类型推断是正确的 ❗
// ---
// ❗ 单参传构造时，做了运行时的校验，如果传入构造方法的首位参数是非对象类型，则需要指定 key 值，否则会报错 ❗
// ❗ 但是这个情况下，如果唯一的必选属性是对象类型，则会与整项传参的重载有概念上的混淆，此时必须指定第二个参数 key，否则将会当作整项传值，是存在运行时不安全的问题的 ❗
// ❗ 需要加强开发时类型推断 - 检测到单必选参数时，优先单参传值模式，要保证首位参数的类型推导优先，且此时 key 值在类型推导上为必传 ❗
// ❗ 例如单参是字符串枚举的话，推导出缺少两个参数传递的同时，首位参数的类型枚举要推导出，第二个参数推导出必选参数的 key 枚举 ❗
// ❗ 单参如果是对象的话，和整项传参重载有概念上的混淆，优先重载到整项传参，如果需要指定是单参传值模式，可以再手动传入一个泛型参数，这个参数自动推导成必选参数的 key 值枚举，后面的调用重载自动切换到单参传值模式 ❗
// ❗ 加强开发时类型推断 ❗
// ---
import createObj from '.'

// --------- 无泛型使用 ---------
const user = createObj({ name: 'Alice', age: 30 })
  .setName('Bob')
  .setAge(25)
console.log(user) // { name: 'Bob', age: 25 }

// --------- 有泛型 - 多必选 ---------
interface User { name?: string, key: number, label: string }
// const forcedUser = createObj<User>({ key: 1 }).setName('Bob') // 开发时类型推断错误，因为缺少必选参数 label - 但是无法保证运行时一定有 label 值
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
