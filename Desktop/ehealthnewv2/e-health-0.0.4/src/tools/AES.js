import { Base64 } from 'js-base64'

const aesjs = require('aes-js')

// An example 128-bit key
var key = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]

// The initialization vector (must be 16 bytes)
var iv = [21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]

export function encrypt(text) {
  text = Base64.encode(text)
  // Convert text to bytes
  var textBytes = aesjs.utils.utf8.toBytes(text)

  var aesOfb = new aesjs.ModeOfOperation.ofb(key,iv)
  var encryptedBytes = aesOfb.encrypt(textBytes)

  // To print or store the binary data, you may convert it to hex
  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes)
  return encryptedHex
}

export function decrypt(encryptedHex) {
  const re = /[0-9A-Fa-f]{6}/g
  if(!re.test(encryptedHex)) return encryptedHex
  // When ready to decrypt the hex string, convert it back to bytes
  var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex)

  // The output feedback mode of operation maintains internal state,
  // so to decrypt a new instance must be instantiated.
  var aesOfb = new aesjs.ModeOfOperation.ofb(key,iv)
  var decryptedBytes = aesOfb.decrypt(encryptedBytes)

  // Convert our bytes back into text
  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes)

  return Base64.isValid(decryptedText) ? Base64.decode(decryptedText) : decryptedText
}