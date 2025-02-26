/**
 * @group unit/utils
 */

import * as string from '@polkadot/util/string'
import { Keyring } from '@polkadot/keyring'
import type { KeyringPair } from '@polkadot/keyring/types'
import nacl from 'tweetnacl'
import * as Crypto from './Crypto'

const messageStr = 'This is a test'
const message = new Uint8Array(string.stringToU8a(messageStr))

describe('helper functions', () => {
  it('converts string to Uint8Array', () => {
    // hex as string mode defaults to false, hex strings are interpreted as numbers
    expect(Crypto.coToUInt8('0x1a')).toMatchInlineSnapshot(`
      Uint8Array [
        26,
      ]
    `)
    expect(Crypto.coToUInt8('0x1a', false)).toMatchInlineSnapshot(`
      Uint8Array [
        26,
      ]
    `)
    // hex as string mode treats hex strings as regular strings
    expect(Crypto.coToUInt8('0x1a', true)).toMatchInlineSnapshot(`
      Uint8Array [
        48,
        120,
        49,
        97,
      ]
    `)
  })

  it('should hash', () => {
    expect(Crypto.hash(message)).toHaveLength(32)
    expect(Crypto.hash(message)).toEqual(Crypto.hash(message))
    expect(Crypto.hash('123')).toEqual(Crypto.hash('123'))

    expect(Crypto.hash(new Uint8Array([0, 0, 0]))).not.toEqual(
      Crypto.hash(message)
    )
    expect(Crypto.hash('123')).not.toEqual(Crypto.hash(message))
    expect(Crypto.hashStr('123')).not.toEqual(Crypto.hashStr(message))
  })

  it('should sort objects when hashing', () => {
    expect(Crypto.hashObjectAsStr({ a: 1, b: 2 })).toEqual(
      Crypto.hashObjectAsStr({ b: 2, a: 1 })
    )
    expect(Crypto.hashObjectAsStr({ a: 1, b: 2 })).not.toEqual(
      Crypto.hashObjectAsStr({ b: 1, a: 2 })
    )
    // with nonce
    expect(Crypto.hashObjectAsStr({ a: 1, b: 2 }, 'abc')).toEqual(
      Crypto.hashObjectAsStr({ b: 2, a: 1 }, 'abc')
    )
    expect(Crypto.hashObjectAsStr({ a: 1, b: 2 }, 'abc')).not.toEqual(
      Crypto.hashObjectAsStr({ b: 1, a: 2 }, 'abc')
    )
    expect(Crypto.hashObjectAsStr({ a: 1, b: 2 }, 'abc')).not.toEqual(
      Crypto.hashObjectAsStr({ b: 2, a: 1 }, 'acab')
    )
  })

  it('hashObjectAsStr hashes numbers as strings', () => {
    expect(Crypto.hashObjectAsStr(1)).toEqual(Crypto.hashStr('1'))
    expect(Crypto.hashObjectAsStr(1)).not.toEqual(
      Crypto.hashStr(Uint8Array.from([1]))
    )
  })

  it('hashObjectAsStr hashes boolean as strings', () => {
    expect(Crypto.hashObjectAsStr(true)).toEqual(Crypto.hashStr('true'))
    expect(Crypto.hashObjectAsStr(false)).toEqual(Crypto.hashStr('false'))
  })

  it('converts buffer to Uint8Array', () => {
    const testarray = [1, 2, 3, 4, 5]
    expect(Crypto.coToUInt8(Buffer.from(testarray))).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        3,
        4,
        5,
      ]
    `)
    expect(Crypto.coToUInt8(Uint8Array.from(testarray))).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        2,
        3,
        4,
        5,
      ]
    `)
  })

  it('hashes statements with defaults', () => {
    let hashed: Array<Record<string, string>>
    const statements = ['a', 'b', 'c']
    const digests = [
      '0x8928aae63c84d87ea098564d1e03ad813f107add474e56aedd286349c0c03ea4',
      '0x6e5c1f45cbaf19f94230ba3501c378a5335af71a331b5b5aed62792332288dc3',
      '0xed5402299a6208014e0f5f25ae6ca3badddc95db67dce164cb8aa086bd48978a',
    ]
    hashed = Crypto.hashStatements(statements)
    expect(hashed.map((i) => i.digest)).toEqual(digests)
    // no nonces
    hashed = Crypto.hashStatements(statements, { nonceGenerator: () => '' })
    expect(hashed.map((i) => i.digest)).toEqual(digests)
    expect(hashed.map((i) => i.saltedHash)).toMatchInlineSnapshot(`
      Array [
        "0x3d4b9478848e85771d9d678f2d80966bf9ea36f0d05b44fe5b23433e14a3eace",
        "0x56c8f25bc8a9a8921c756c41f47efceb12c8129a9569456f7d80955bfcec2dcf",
        "0x46ee56523ea5289f05709c26f6be6b08f364a3f2d6a5a8b6cfb2839bfe6a506e",
      ]
    `)
    // with nonces
    hashed = Crypto.hashStatements(statements, {
      nonces: digests.reduce<Record<string, string>>((p, n, i) => {
        return { ...p, [n]: ['a', 'b', 'c'][i] }
      }, {}),
    })
    expect(hashed.map((i) => i.digest)).toEqual(digests)
    expect(hashed.map((i) => i.saltedHash)).toMatchInlineSnapshot(`
      Array [
        "0x7126bd9e273ae6a1b2cfdc5f987b0f862cf2db77fea9b017963fec83b328784d",
        "0xda617d15abd22984c2f1927f4e23a101696b7495c83ac178bbb91818ec102117",
        "0x4e31eef9054d0d8682707880a414b86fafaa963b19220d03273eae764ad0bc1d",
      ]
    `)
  })
})

describe('Symmetric Crypto', () => {
  let alice: KeyringPair
  let alicePubKey: string
  let bob: KeyringPair
  let bobPubKey: string

  beforeAll(async () => {
    const keyring = new Keyring({
      type: 'ed25519',
      // KILT has registered the ss58 prefix 38
      ss58Format: 38,
    })
    alice = keyring.addFromUri('//Alice')
    alicePubKey = Crypto.u8aToHex(alice.publicKey)
    bob = keyring.addFromUri('//Bob')
    bobPubKey = Crypto.u8aToHex(bob.publicKey)
  })

  it('should sign and verify (UInt8Array)', () => {
    const signature = Crypto.sign(message, alice)
    expect(signature).not.toBeFalsy()
    expect(Crypto.verify(message, signature, alice.address)).toBe(true)

    expect(Crypto.verify(message, signature, bob.address)).toBe(false)
    expect(
      Crypto.verify(new Uint8Array([0, 0, 0]), signature, alice.address)
    ).toBe(false)
  })

  it('should sign and verify (string)', () => {
    const signature = Crypto.signStr(messageStr, alice)
    expect(signature).not.toBeFalsy()
    expect(Crypto.verify(messageStr, signature, alicePubKey)).toBe(true)

    expect(Crypto.verify(messageStr, signature, bobPubKey)).toBe(false)
    expect(Crypto.verify('0x000000', signature, alicePubKey)).toBe(false)
  })

  // https://polkadot.js.org/common/examples/util-crypto/01_encrypt_decrypt_message_nacl/
  it('should encrypt and decrypt symmetrical using random secret key (UInt8Array)', () => {
    const secret = new Uint8Array([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
    ])
    const data = Crypto.encryptSymmetric(message, secret)
    expect(data).not.toBeFalsy()
    expect(Crypto.decryptSymmetric(data, secret)).toEqual(message)
    const dataWithNonce = Crypto.encryptSymmetric(message, secret, data.nonce)
    expect(Crypto.decryptSymmetric(dataWithNonce, secret)).toEqual(message)
  })

  // https://polkadot.js.org/common/examples/util-crypto/01_encrypt_decrypt_message_nacl/
  it('should encrypt and decrypt symmetrical using random secret key (string)', () => {
    const secret =
      '0x000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F'

    const data = Crypto.encryptSymmetricAsStr(messageStr, secret)
    expect(data).not.toBeFalsy()
    expect(Crypto.decryptSymmetricStr(data, secret)).toEqual(messageStr)
    expect(
      Crypto.decryptSymmetricStr(
        { encrypted: '0x000102030405060708090A0B0C0D0E0F', nonce: data.nonce },
        secret
      )
    ).toEqual(null)
    const dataWithNonce = Crypto.encryptSymmetricAsStr(
      messageStr,
      secret,
      data.nonce
    )
    expect(Crypto.decryptSymmetricStr(dataWithNonce, secret)).toEqual(
      messageStr
    )
  })
})

describe('asymmetric crypto', () => {
  let alice: nacl.BoxKeyPair
  let bob: nacl.BoxKeyPair

  beforeAll(() => {
    alice = nacl.box.keyPair()
    bob = nacl.box.keyPair()
  })

  it('should encrypt and decrypt asymmetrical (string)', () => {
    const encrypted = Crypto.encryptAsymmetricAsStr(
      messageStr,
      alice.publicKey,
      bob.secretKey
    )
    expect(encrypted).not.toEqual(messageStr)
    const decrypted = Crypto.decryptAsymmetricAsStr(
      encrypted,
      bob.publicKey,
      alice.secretKey
    )
    expect(decrypted).toEqual(messageStr)
    const decryptedFalse = Crypto.decryptAsymmetricAsStr(
      encrypted,
      bob.publicKey,
      bob.secretKey
    )
    expect(decryptedFalse).toEqual(false)
  })
  it('should encrypt and decrypt asymmetrical (UInt8Array)', () => {
    const encrypted = Crypto.encryptAsymmetric(
      message,
      alice.publicKey,
      bob.secretKey
    )
    expect(encrypted).not.toEqual(message)
    const decrypted = Crypto.decryptAsymmetric(
      encrypted,
      bob.publicKey,
      alice.secretKey
    )
    expect(decrypted).toEqual(message)
  })
})
