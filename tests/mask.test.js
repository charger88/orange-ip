const {OrangeIPv4Mask} = require('./../index')

test.each([
  [0, "0.0.0.0"],
  [1, "128.0.0.0"],
  [2, "192.0.0.0"],
  [17, "255.255.128.0"],
  [22, "255.255.252.0"],
  [23, "255.255.254.0"],
  [24, "255.255.255.0"],
  [32, "255.255.255.255"],
])('mask to prefix length, prefix length to mask', (prefix_length, mask_string) => {
  const mask = OrangeIPv4Mask.createFromPrefixLength(prefix_length)
  expect(mask.toString()).toBe(mask_string)
  const mask2 = new OrangeIPv4Mask(mask_string)
  expect(mask2.prefix_length).toBe(prefix_length)
})

test.each([
  ['10.0.0.0'],
  ['160.0.0.0'],
  ['128.0.0.1'],
  ['255.128.128.0'],
  ['0.255.255.255'],
])('incorrect masks', (mask) => {
  const t = () => {
    new OrangeIPv4Mask(mask)
  }
  expect(t).toThrow(Error)
  expect(t).toThrow('Incorrect subnet mask')
})
