const {OrangeIPv4Subnet} = require('./../index')

test.each([
  ['127.0.0.0/20', '127.0.0.0', true],
  ['127.0.0.0/20', '127.0.0.1', true],
  ['127.0.0.0/20', '127.0.0.10', true],
  ['127.0.0.0/20', '127.0.0.255', true],
  ['127.0.0.0/20', '127.0.1.255', true],
  ['127.0.0.0/20', '127.0.255.255', false],
  ['127.0.0.0/20', '128.0.0.1', false],
  ['127.0.0.0/20', '126.255.255.255', false],
  ['127.0.0.0/20', '127.1.0.0', false],
  ['127.0.0.0', '127.0.0.0', true],
  ['127.0.0.0', '127.0.0.1', false],
  ['127.0.0.0', '127.0.0.10', false],
  ['127.0.0.0', '127.0.0.255', false],
  ['127.0.0.0', '127.0.1.255', false],
  ['127.0.0.0', '127.0.255.255', false],
  ['127.0.0.0', '128.0.0.1', false],
  ['127.0.0.0', '126.255.255.255', false],
  ['127.0.0.0', '127.1.0.0', false],
  ['127.0.0.0', '127.1.0.0', false],
  ['255.255.255.0/25', '255.255.255.128', false],
  ['255.255.255.0/24', '255.255.255.0', true],
])('is IP in the subnet', (subnet_string, ip, result) => {
  expect(OrangeIPv4Subnet.createFromSlashFormat(subnet_string).isIpInTheSubnet(ip)).toBe(result)
})

test.each([
  ['127.0.0.1/30', '127.0.0.0/30'],
  ['127.0.0.4/30', '127.0.0.4/30'],
  ['127.0.0.1', '127.0.0.1/32'],
  ['8.8.8.8/8', '8.0.0.0/8'],
])('to string', (input, output) => {
  expect(`${OrangeIPv4Subnet.createFromSlashFormat(input)}`).toBe(output)
})
