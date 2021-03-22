const {OrangeIPv4Address} = require('./../index')

test.each([
  ['192.168.0.1'],
  ['0.0.0.0'],
  ['255.255.255.255'],
])('regular', ip => {
  const address = new OrangeIPv4Address(ip)
  expect(address.toString()).toBe(ip)
})

test.each([
  ['1.0.0.0', Math.pow(2, 24)],
  ['4.0.2.0', Math.pow(2, 24) * 4 + Math.pow(2, 8) * 2],
])('number', (ip, number) => {
  const address = new OrangeIPv4Address(ip)
  expect(address.int_value).toBe(number)
})

test.each([
  ['256.255.255.255', 'IP V4 segment can\'t be more than 255'],
  ['255.-1.255.255', 'IP V4 segment can\'t be less than 0'],
  ['255.255.255.255.', 'IP V4 should have 4 segments'],
  [-1, 'IP is out of range (negative)'],
  [4294967296, 'IP is out of range (too large)'],
])('address - exceptions', (ip, exception_message) => {
  const t = () => {
    new OrangeIPv4Address(ip)
  }
  expect(t).toThrow(Error)
  expect(t).toThrow(exception_message)
})

test.each([
  ['10.0.255.0'],
  ['127.0.0.0'],
  ['127.255.255.255'],
  ['192.168.0.1'],
  ['193.0.0.1'],
  ['255.255.255.254'],
  ['255.255.255.255'],
])('attributes', (ip) => {
  expect((new OrangeIPv4Address(ip)).toString()).toBe(ip)
})

test.each([
  ['10.0.255.0', true, false, false],
  ['127.0.0.0', false, true, false],
  ['127.255.255.255', false, true, false],
  ['192.168.0.1', true, false, false],
  ['193.0.0.1', false, false, true],
  ['239.255.255.255', false, false, true],
  ['255.255.255.255', false, false, false],
])('attributes', (ip, is_private, is_local, is_public) => {
  expect((new OrangeIPv4Address(ip)).is_private).toBe(is_private)
  expect((new OrangeIPv4Address(ip)).is_loopback).toBe(is_local)
  expect(!(new OrangeIPv4Address(ip)).is_special).toBe(is_public)
})
