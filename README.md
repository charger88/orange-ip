# Orange IP

Library for working with IP addresses.

## Example

Let's say we have some config with whitelisted sub networks / IP addresses and we want to see if user's IP is whitelisted.

_Actually there is a method `OrangeIPv4Subnet.isIpInOneOfTheSubnets`, but let's pretend we don't have it :)_

```javascript
const {OrangeIPv4Subnet} = require("orange-ip")

const WHITELISTED = "10.0.0.0/8;45.55.52.131".split(';').map(v => new OrangeIPv4Subnet(v))

function is_whitelisted(ip) {
  for (const s of WHITELISTED) {
    if (s.isIpInTheSubnet(ip)) return true
  }
  return false
}

console.log(is_whitelisted("45.55.52.131")) // true
console.log(is_whitelisted("10.10.10.10")) // true
console.log(is_whitelisted("8.8.8.8")) // false
```

## Classes

### OrangeIPv4Standard

Class provides some data related to the IPv4 standard
 
| Element | Name | Type | Description |
|---|---|---|---|
| static property | `PRIVATE_NETWORKS` | `string[]` | List of private-use networks: https://tools.ietf.org/html/rfc1918 |
| static property | `LOOPBACK_NETWORKS` | `string[]` | List of loopback networks: https://tools.ietf.org/html/rfc1122#section-3.2.1.3 | 
| static property | `DOCUMENTATION_NETWORKS` | `string[]` | List of documentation (TEST-NET-...) networks: https://tools.ietf.org/html/rfc5737 |
| static property | `ALL_SPECIAL_NETWORKS` | `string[]` | List of all special networks described in RFC 6890: https://tools.ietf.org/html/rfc6890 |

### OrangeIPv4Address

IPv4 address
 
| Element | Name | Type | Description |
|---|---|---|---|
| method | `constructor` |  | Constructor |
| property | `int_value` | `number` | Integer value of the address |
| method | `toString` | `string` | Converts object to string in XXX.XXX.XXX.XXX format |
| method | `isIpInOneOfTheSubnets` | `boolean` | Returns if IP address in one of the networks |
| property | `is_special` | `boolean` | True if IP address is in one of special networks described in RFC 6890 (`OrangeIPv4Standard.ALL_SPECIAL_NETWORKS`) |
| property | `is_private` | `boolean` | True if IP address is private |
| property | `is_loopback` | `boolean` | True if IP address is a loopback |

### OrangeIPv4Mask

IPv4 subnet mask
 
| Element | Name | Type | Description |
|---|---|---|---|
| method | `constructor` |  | Constructor |
| property | `int_value` | `number` | Integer value of the address |
| method | `toString` | `string` | Converts object to string in XXX.XXX.XXX.XXX format |
| static method | `createFromPrefixLength` | `OrangeIPv4Mask` | Creates subnet mask object from network prefix length |
| property | `prefix_length` | `number` | Network prefix length |

### OrangeIPv4Subnet

IPv4 subnet
 
| Element | Name | Type | Description |
|---|---|---|---|
| method | `constructor` |  | Constructor |
| static method | `createFromSlashFormat` | `OrangeIPv4Subnet` | Creates subnet object from string |
| method | `toString` | `string` | Converts object to string in xxx.xxx.xxx.xxx/zz format |
