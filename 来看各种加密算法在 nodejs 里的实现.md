在大前端的趋势下，前端er也要懂点数据加密相关的知识才行，加密算法的实现和原理我们可以不用深究，毕竟加密是一门高深的学科，但是基本的加密方式和编码还是要掌握的，毕竟没吃过猪肉，猪跑还是见过的嘛。

我对常见的几种加密和签名的算法做个归纳，同时附上 `nodejs` 的编码实现。

### 加密算法
为了保证数据的安全性和防篡改，很多数据在传输中都进行了加密。举个场景的栗子，最近很多网站都升级到 `https` 协议， `https` 协议就是使用了非对称加密和hash签名，还有 `github` 使用的 `ssh` ，也是非对称加密。还有大部分登录时密码采用的 `MD5` 加密等等。

加密可分为三大类，对称加密和非对称加密，还有摘要算法，我们一一展开。

### 对称加密
引用百科的描述:
> 采用单钥密码系统的加密方法，同一个密钥可以同时用作信息的加密和解密，这种加密方法称为对称加密，也称为单密钥加密。

对称加密很好理解，就好比我把我家的钥匙给你，你要来我家，直接用这把钥匙开门就行。

![对称加密](./image/encrypt/1.jpg)

对称加密目前主流的有 `AES` 和 `DES` ， `AES` 是新一代的标准，速度快，安全级别更高。

#### AES

AES的加密模式有五种：`CBC、ECB、CTR、OCF、CFB`

1. ECB：电子密本方式，需要一个密钥即可，特点是简单，利于并行计算。
2. CBC：密文分组链接方式，除了需要一个密钥之外，还需要一个向量，向量的作用也是用于数据的加密，所以这个的安全性要好于 ECB
3. CTR、OCF、CFB：具体算法的实现方式不一样，优缺点也各不相同，而这几个都同 CBC 一样，都需要密钥和向量。

AES 有三种长度 128位、192位、256位，这三种的区别，主要来自于密钥的长度，16字节密钥=128位，24字节密钥=192位，32字节密钥=256位。如下表格：

| 长度        | 密钥长度    |  向量长度  
| --------    | :-----:   | :----: |
| 128位       | 16      |   16    |
| 192位       | 24      |   16   |
| 256位       | 32      |   16   |

#### DES
加密默认与 `AES` 相同，也有五种模式，除了 `ECB` 只需要密钥，其他模式需要密钥和向量。

与 `AES` 不同的是， `DES` 的密钥长度只有8字节，向量也是8字节。

#### 编码实现
在 nodejs 中的实现

```javascript
/**
 * @description 
 * 对称加密
 * @param {*} data 加密数据
 * @param {*} algorithm 加密算法
 * @param {*} key 密钥
 * @param {*} iv 向量
 * @returns
 */
function cipherivEncrypt(data, algorithm, key, iv) {
    const cipheriv = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipheriv.update(data, 'utf8', 'hex');
    encrypted += cipheriv.final('hex');
    return encrypted
}

/**
 * @description
 * 对称解密
 * @param {*} data 解密数据
 * @param {*} algorithm 解密算法
 * @param {*} key 密钥
 * @param {*} iv 向量
 * @returns
 */
function cipherivDecrypt(data, algorithm, key, iv) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted
}
```

使用官方提供 `crypto` 库来实现加解密，上面的代码中加密后输出的是 `16` 进制的字符串，大家可以根据具体情况换成其他格式的数据。

调用方式如下
```javascript
// AES对称加解密
const str = 'xiaoliye';
const key = 'aaaaaaaaaaaaaaaaaaaaaaaa'; // 24
const iv = 'aaaaaaaaaaaaaaaaaaaaaaaa';  // 24
const cipherAesText = cipherivEncrypt(str, 'aes-192-cfb', key,iv)
const resultText = cipherivDecrypt(cipherAesText, 'aes-192-cfb', key,iv)
console.log(resultText === str) // true
```

```javascript
// DES对称加解密
const str = 'xiaoliye';
const key = 'aaaaaaaa'; //8
const iv = 'aaaaaaaa';  //8
const cipherAesText = cipherivEncrypt(str, 'des-cfb', key,iv)
const resultText = cipherivDecrypt(cipherAesText, 'des-cfb', key,iv)
console.log(resultText === str) / true
```

### 非对称加密
非对称加密，有两把钥匙，公钥和私钥，如下图：

![非对称加密](./image/encrypt/2.jpg)

公钥是可以公开对外，私钥就是自个的，不可泄露。因为有两个密钥，非对称加密这个名字就是这么由来的。

发送方用接收方公开对外的公钥进行加密，接收方收到数据后，用私钥进行解密，业务处理完后，用私钥给需要回传的数据加密，收到数据的一方在用公钥解密。

这个过程就是非对称加解密，简单理解就是公钥加密的数据，用私钥解密；私钥加密的数据，用公钥解密。

非对称加密与对称加密相比，安全性要高很多。对于对称加密，密钥钥匙被某一方不小心泄露了，那秘文就有可能被破解和篡改。而非对称加密，公钥随意流通，只要颁发密钥的一方好好把私钥保管好，安全性是妥妥的。

#### 编码实现
我们来看 node 中的编码实现，还是使用官方提供的 `crypto` 库

1. 加解密函数接收的数据是 Buffer 类型，(关于 Buffer 的介绍，不了解的朋友可以看下这篇[二进制与Buffer](https://juejin.im/post/5d188e1fe51d454fd8057bc9))，所以需要约定好接收和输出的数据类型。
2. 参数 `padding` 是填充方式，有这么几种 `crypto.constants.RSA_NO_PADDING, crypto.constants.RSA_PKCS1_PADDING, crypto.constants.RSA_PKCS1_OAEP_PADDING`，因为没有深入研究过，就不展开啦，不过有一点，加密和解密的填充方式必须是要一致的。

```javascript
const constants = require('constants')
const crypto = require('crypto')

/**
 * @description
 * 公钥加密数据
 * @param {*} data 待加密数据
 * @param {*} publicKey 公钥
 * @param {*} inputEncoding 加密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function publicEncrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
    const encryptText = crypto.publicEncrypt({
        key: publicKey,
        padding: padding || constants.RSA_PKCS1_PADDING
    }, Buffer.from(data, inputEncoding));

    return encryptText.toString(outputEncoding);
}

/**
 * @description
 * 公钥解密数据
 * @param {*} data 待解密数据
 * @param {*} publicKey 公钥
 * @param {*} inputEncoding 解密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function publicDecrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
    let decryptText = '';
    const decryptText = crypto.publicDecrypt({
        key: publicKey,
        padding: padding || constants.RSA_PKCS1_PADDING
    }, Buffer.from(data, inputEncoding));

    return decryptText.toString(outputEncoding);
}

/**
 * @description
 * 私钥加密数据
 * @param {*} data 待加密数据
 * @param {*} privateKey 私钥
 * @param {*} inputEncoding 加密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function privateEncrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
    const encryptText = crypto.privateEncrypt({
        key: privateKey,
        padding: padding || constants.RSA_PKCS1_PADDING
    }, Buffer.from(data, inputEncoding));

    return encryptText.toString(outputEncoding);
}

/**
 * @description
 * 私钥解密数据
 * @param {*} data 待解密数据
 * @param {*} privateKey 私钥
 * @param {*} inputEncoding 解密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function privateDecrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
    const decryptText = crypto.privateDecrypt({
        key: privateKey,
        padding: padding || constants.RSA_PKCS1_PADDING
    }, Buffer.from(data, inputEncoding));
    return decryptText.toString(outputEncoding);
}
```

有四个函数，分别是公钥的加解密和私钥的加解密，我们看下如何使用，示例中是我自己生成的密钥对，大家可以自行替换

```javascript
const rsaPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCncWDMXEToSxtGQCmWY2ywl5CQ
tb81PXYZch4v5M8MNUZPpcmf+VDXQbuWqqTqV/tY7rLviu/BAkFbX9NiFCapF5lP
siVwSGWJQwq0S/++RCwB6yFVEzOKL25jANRBVNwmSOzojveCStYPcEs5Q829ld68
9TzluDDqUS69dTHGkQIDAQAB
-----END PUBLIC KEY-----`

const rsaPrivateKey = `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAKdxYMxcROhLG0ZA
KZZjbLCXkJC1vzU9dhlyHi/kzww1Rk+lyZ/5UNdBu5aqpOpX+1jusu+K78ECQVtf
02IUJqkXmU+yJXBIZYlDCrRL/75ELAHrIVUTM4ovbmMA1EFU3CZI7OiO94JK1g9w
SzlDzb2V3rz1POW4MOpRLr11McaRAgMBAAECgYEAhNa8/cQh4sxbKgOTOr1MKFlG
Fpgpxroo7I0Nh9+Vp1DIpD2Z1PF9ghijEyf0R/pe7LIKgWIPTWdVpIFEeSYVeH43
FLr3zwR9oXzwG7RQTSN4d/Xcvg+24ZxCrvDfn7qDIlXh0jOS0wCvna1or7xgPcOu
XG8J3BNbBdUixM0lk0ECQQDR4SCelWn0BY21jsFobX+pGqKOsj+tuvU4Cz47Gmev
qvq2suYXwLemkP7EqRu8iNso/IzvrdsuJDG76dzwC4D5AkEAzDz2cDrKOVmqYw7s
luOQFHl1TzmY7Umpd9YbZ5iXn0eCjIn1/e1risRF5+IeSpB84OVltUzj4cVDCbFd
9S1wWQJAIeKcFp5+9cPzxi1fMpIDO3Uua6WBvHXj44GFMZuow+byBY9KsOkPfZgJ
Wg0Hil/6KlrkEkpaic+ULAetASCKWQJAdMh/Gdlj/LsaxJ2qBvWEU1DIFU8X9Mbk
ElPpQ6lrOXaIXZgdgt8ZWTW1y0vuijBoV6iUKcEXpOdI1+gFk8YxsQJBAJsGJClf
E1mE6CZgegM82428g4osZznVXBO/QtrQsA78S1xo8bo4qwVm0jQBcto65gwlfeeB
Xm7MiIvNVBqzTVs=
-----END PRIVATE KEY-----
`

const str = 'xiaoliye'
const cipherText = publicEncrypt(str, rsaPublicKey, 'utf8', 'hex') // 公钥加密
const decryptText = privateDecrypt(cipherText, rsaPrivateKey, 'hex', 'utf8') // 私钥解密
console.log(str === decryptText) // true

const cipherTextPrivate = privateEncrypt(str,rsaPrivateKey,'utf8', 'hex') // 私钥加密
const decryptTextPublic = publicDecrypt(cipherTextPrivate,rsaPublicKey, 'hex', 'utf8') // 公钥解密
console.log(str === decryptTextPublic) // true

```

#### 密钥生成方式
网上有很多工具可以一键生成配对的公钥和私钥，淘宝、微信都有提供相关工具，或者使用 `OpenSSL` 生成也可以。

### 摘要算法（HASH）
把任意长度的输入，根据算法生成一串固定长度的伪随机数，这一算法就是摘要算法，它有这么几个特点
1. 不需要密钥，加密出来的数据无法被解密，具有不可逆性。
2. 生成的摘要长度是固定的，与输入无关。
3. 相同的输入，使用相同的实现，生成的摘要一定相同；不同的输入，生成的摘要是大相径庭的，即，不会发生碰撞。

根据这些特点，摘要算法通常用于生成签名，用来验证数据的完整性。

还有用户密码的存储，如今密码的存储主流的方式，就是使用摘要算法生成唯一的标识，为了保证安全性，通常在生成摘要后再加上一串随机数(加盐salt)，在来hash一次。

目前主流的实现有 `MD5` 和 `SHA-2` ， `MD5` 生成的摘要是 `32` 字节， `sha256` 生成的摘要是 `64` 字节。

#### 编码实现
仍然是使用官方提供的 `crypto` 库

```javascript
/**
 * @description
 * md5
 * @param {*} data
 * @returns
 */
function md5(data){
    const hash = crypto.createHash('md5');
    return hash.update(data).digest('hex');
}

/**
 * @description
 * sha256
 * @param {*} data
 * @returns
 */
function sha256(data){
    const hash = crypto.createHash('sha256');
    return hash.update(data).digest('hex');
}

console.log(md5('asdf')) // 912ec803b2ce49e4a541068d495ab570
console.log(sha256('asdf')) // f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b
```

### 小结
涉及加密的活一般是后台开发干的，但前端靓仔懂点加密，会让自己酷酷的~

小伙伴们还有遇到啥其他加密的方式，欢迎一起交流啊~