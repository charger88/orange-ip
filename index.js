/**
 * Bitwise operations return signed Int32 data type, so we can't just use "&" to get numeric value
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function and (a, b) {
  let v = a & b
  return v < 0 ? Math.pow(2, 32) + v : v
}

const IPV4_SEGMENTS = 4

/**
 * Class provides some data related to the IPv4 standard
 */
class OrangeIPv4Standard {

  /**
   * List of private-use networks: https://tools.ietf.org/html/rfc1918
   *
   * @return {string[]}
   * @constructor
   */
  static get PRIVATE_NETWORKS () {
    return ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
  }

  /**
   * List of loopback networks: https://tools.ietf.org/html/rfc1122#section-3.2.1.3
   *
   * @return {string[]}
   * @constructor
   */
  static get LOOPBACK_NETWORKS () {
    return ['127.0.0.0/8']
  }

  /**
   * List of documentation (TEST-NET-...) networks: https://tools.ietf.org/html/rfc5737
   *
   * @return {string[]}
   * @constructor
   */
  static get DOCUMENTATION_NETWORKS () {
    return ['192.0.2.0/24', '198.51.100.0/24', '203.0.113.0/24']
  }

  /**
   * List of all special networks described in RFC 6890
   * https://tools.ietf.org/html/rfc6890
   *
   * @return {string[]}
   * @constructor
   */
  static get ALL_SPECIAL_NETWORKS () {
    return [
      '0.0.0.0/8', // "This host on this network": https://tools.ietf.org/html/rfc1122#section-3.2.1.3
      '100.64.0.0/10', // Shared Address Space: https://tools.ietf.org/html/rfc6598
      '169.254.0.0/16', // Link Local: https://tools.ietf.org/html/rfc3927
      '192.0.0.0/24', // IETF Protocol Assignments: https://tools.ietf.org/html/rfc6890#section-2.1
      '192.0.0.0/29', // DS-Lite: https://tools.ietf.org/html/rfc6333
      '192.88.99.0/24', // 6to4 Relay Anycast: https://tools.ietf.org/html/rfc3068
      '198.18.0.0/15', // Benchmarking: https://tools.ietf.org/html/rfc2544
      '240.0.0.0/4', // Reserved: https://tools.ietf.org/html/rfc1112#section-4
      '255.255.255.255/32', // Limited Broadcast: https://tools.ietf.org/html/rfc0919#section-7
    ]
      .concat(this.PRIVATE_NETWORKS)
      .concat(this.DOCUMENTATION_NETWORKS)
      .concat(this.LOOPBACK_NETWORKS)
  }

}

/**
 * Common class for mask and IP address
 *
 * @abstract
 */
class OrangeIPv4Abstract {

  /**
   *
   * @param {string|number} address IP address in XXX.XXX.XXX.XXX format or numeric value of the IP address
   */
  constructor (address) {
    let nv = 0
    if (typeof address === 'string') {
      const address_parts = address.split('.').map(v => parseInt(v))
      if (address_parts.length !== IPV4_SEGMENTS) throw new Error('IP V4 should have 4 segments')
      for (let i = 0; i < IPV4_SEGMENTS; i++) {
        if (address_parts[i] < 0) throw new Error('IP V4 segment can\'t be less than 0')
        if (address_parts[i] > 255) throw new Error('IP V4 segment can\'t be more than 255')
        nv += address_parts[i] * Math.pow(256, IPV4_SEGMENTS - i - 1)
      }
    } else {
      if (address < 0) throw new Error(`IP is out of range (negative): ${address}`)
      if (address >= 4294967296) throw new Error(`IP is out of range (too large): ${address}`)
      nv = address
    }
    this._int_value = nv
  }

  /**
   * Integer value of the address
   *
   * @type {number}
   */
  get int_value () {
    return this._int_value
  }

  /**
   * Returns address in xxx.xxx.xxx.xxx format
   *
   * @return {string}
   */
  toString () {
    const segments = []
    for (let i = 0; i < IPV4_SEGMENTS; i++) {
      segments.push(Math.floor(this._int_value / Math.pow(256, IPV4_SEGMENTS - i - 1)) % 256)
    }
    return segments.map(v => v.toString()).join('.')
  }

}

/**
 * IPv4 address
 */
class OrangeIPv4Address extends OrangeIPv4Abstract {

  /**
   * Returns if IP address in one of the networks
   *
   * @param {string[]} networks
   * @return {boolean}
   */
  isIpInOneOfTheSubnets (networks) {
    for (const s of networks) {
      if (OrangeIPv4Subnet.createFromSlashFormat(s).isIpInTheSubnet(this)) return true
    }
    return false
  }

  /**
   * True if IP address is in one of special networks described in RFC 6890
   * https://tools.ietf.org/html/rfc6890
   *
   * @type {boolean}
   */
  get is_special () {
    return this.isIpInOneOfTheSubnets(OrangeIPv4Standard.ALL_SPECIAL_NETWORKS)
  }

  /**
   * True if IP address is private
   *
   * @type {boolean}
   */
  get is_private () {
    return this.isIpInOneOfTheSubnets(OrangeIPv4Standard.PRIVATE_NETWORKS)
  }

  /**
   * True if IP address is a loopback
   *
   * @type {boolean}
   */
  get is_loopback () {
    return this.isIpInOneOfTheSubnets(OrangeIPv4Standard.LOOPBACK_NETWORKS)
  }

}

/**
 * IPv4 subnet mask
 */
class OrangeIPv4Mask extends OrangeIPv4Abstract {

  /**
   *
   * @param {string|number} address mask in XXX.XXX.XXX.XXX format or numeric value of the mask
   */
  constructor (address) {
    super(address)
    let zero_started = false
    for (let i = 31; i >= 0; i--) {
      if (this.int_value & Math.pow(2, i)) {
        if (zero_started) throw new Error('Incorrect subnet mask')
      } else {
        zero_started = true
      }
    }
  }

  /**
   * Creates subnet mask object from network prefix length
   *
   * @param {number} prefix_length
   * @return {OrangeIPv4Mask}
   */
  static createFromPrefixLength (prefix_length) {
    let v = 0
    for (let i = (32 - prefix_length); i < 32; i++) {
      v += Math.pow(2, i)
    }
    return new this(v)
  }

  /**
   * Network prefix length
   *
   * @type {number}
   */
  get prefix_length () {
    let count = 0
    const int_value = this.int_value
    for (let i = 31; i >= 0; i--) {
      if (int_value & Math.pow(2, i)) {
        count++
      } else {
        break
      }
    }
    return count
  }

}

/**
 * IPv4 subnet
 */
class OrangeIPv4Subnet {

  /**
   *
   * @param {string|number|OrangeIPv4Address} ip Subnet IP
   * @param {string|number|OrangeIPv4Mask} mask Subnet mask
   */
  constructor (ip, mask = '255.255.255.255') {
    this._ip = typeof ip !== 'object' ? new OrangeIPv4Address(ip) : ip
    this._mask = typeof mask !== 'object' ? new OrangeIPv4Mask(mask) : mask
  }

  /**
   * Creates subnet object from string
   *
   * @param {string} subnet_string Subnet in format xxx.xxx.xxx.xxx/zz - if mask is not defined, "/32" (255.255.255.255) will be applied
   * @return {OrangeIPv4Subnet}
   */
  static createFromSlashFormat (subnet_string) {
    const pss = subnet_string.split('/')
    const ip = pss[0]
    const mask = OrangeIPv4Mask.createFromPrefixLength(pss.length > 1 ? parseInt(pss[1]) : 32)
    return new this(ip, mask)
  }

  /**
   * Network prefix
   *
   * @type {OrangeIPv4Address}
   */
  get prefix () {
    return new OrangeIPv4Address(and(this._mask.int_value, this._ip.int_value))
  }

  /**
   * Returns true if IP address is in the subnet
   *
   * @param {OrangeIPv4Address|string|number} ip IP to be tested
   * @return {boolean}
   */
  isIpInTheSubnet (ip) {
    const test_ip = typeof ip !== 'object' ? new OrangeIPv4Address(ip) : ip
    return and(this._mask.int_value, test_ip.int_value) === this.prefix.int_value
  }

  /**
   * Converts subnet to xxx.xxx.xxx.xxx/zz format
   *
   * @return {string}
   */
  toString () {
    return `${this.prefix}/${this._mask.prefix_length}`
  }

}

module.exports = {OrangeIPv4Standard, OrangeIPv4Address, OrangeIPv4Mask, OrangeIPv4Subnet}
