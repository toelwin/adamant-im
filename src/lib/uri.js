import { isAddress as isEthAddress, isHexStrict } from 'web3-utils'
import { validateBase32Address as isLskAddress } from '@liskhq/lisk-cryptography'
import {
  Cryptos, CryptosQqPrefixes,
  RE_ADM_ADDRESS, RE_BTC_ADDRESS, RE_DASH_ADDRESS, RE_DOGE_ADDRESS, RE_LSK_ADDRESS
} from './constants'

/**
 * Get an ADAMANT URI from the address bar or argv[]
 * Complies with AIP-2, AIP-8, AIP-9
 * @returns {string}
 */
export function getAddressBarURI () {
  let aip2 = ''

  if (process.env.IS_ELECTRON) {
    const args = process.argv
    aip2 = args.find(v => /^adm:U[0-9]{6,}/.test(v)) || ''
  }

  return aip2 || document.URL
}

/**
 * Parse info from an URI containing a cryptocurrency address
 * Complies with AIP-2, AIP-8, AIP-9
 * Sample: https://msg.adamant.im?address=U9821606738809290000&label=John+Doe&amount=1.12&message=Buy+a+beer
 * @param {string} uri URI. Default is address bar or argv[].
 * @returns {
 *   {
 *     address: string,
 *     crypto: string,
 *     params: Object<string, string>,
 *     protocol: string
 *   }
 * }
 */
export function parseURIasAIP (uri = getAddressBarURI()) {
  const [origin, query = ''] = uri.split('?')
  let address = ''
  let crypto = ''
  let params = Object.create(null)
  let protocol = ''

  if (query) {
    params = query.split('&').reduce((accum, param) => {
      const [key, value = ''] = param.split('=')
      return key && value
        ? {
            ...accum,
            [key]: window.decodeURIComponent(
              value.includes('+') ? value.replace(/\+/g, ' ') : value
            )
          }
        : accum
    }, Object.create(null))
  }

  if (origin.includes(':')) {
    [protocol, address] = origin.split(':')
    if (protocol === 'ethereum') {
      crypto = Cryptos.ETH
    } else if (/^https?$/.test(protocol) || /^app$/.test(protocol)) {
      crypto = Cryptos.ADM
      address = params.address; delete params.address
    } else if (Object.prototype.hasOwnProperty.call(Cryptos, protocol.toUpperCase())) {
      crypto = protocol.toUpperCase()
    }
  } else {
    address = origin
    if (RE_ADM_ADDRESS.test(address)) {
      crypto = Cryptos.ADM
    } else if (RE_BTC_ADDRESS.test(address)) {
      crypto = Cryptos.BTC
    } else if (RE_DASH_ADDRESS.test(address)) {
      crypto = Cryptos.DASH
    } else if (RE_DOGE_ADDRESS.test(address)) {
      crypto = Cryptos.DOGE
    } else if (isHexStrict(address) && isEthAddress(address)) {
      crypto = Cryptos.ETH
    } else if (RE_LSK_ADDRESS.test(address)) {
      // We need to use try-catch https://github.com/LiskHQ/lisk-sdk/issues/6652
      try {
        if (isLskAddress(address)) {
          crypto = Cryptos.LSK
        }
      } catch (e) { }
    }
  }

  return { address, crypto, params, protocol }
}

/**
 * Generate a cryptocurrency URI
 * Complies with AIP-8, AIP-9
 * @param {string} address Cryptocurrency address
 * @param {string} name ADAMANT contact name
 * @returns {string}
 */
export function generateURI (crypto = Cryptos.ADM, address, name) {
  if (crypto === Cryptos.ADM) {
    const label = name ? '&label=' + window.encodeURIComponent(name) : ''
    let hostname = window.location.origin
    if (!hostname.startsWith('http')) {
      hostname = 'https://msg.adamant.im'
    }
    return `${hostname}?address=${address}${label}`
  }

  const cryptoQrPrefix = CryptosQqPrefixes[crypto]
  if (cryptoQrPrefix) {
    return `${cryptoQrPrefix}:${address}`
  } else {
    return address
  }
}

/**
 * Replaces https://adamant.im URI to tor-website if host is .onion
 * @param {string} str String, that may contain https://adamant.im URI
 * @returns {string}
 */
export function websiteUriToOnion (str) {
  const hostname = window.location.origin
  if (hostname.includes('.onion')) {
    str = str.replace('https://adamant.im', 'http://adamantim24okpwfr4wxjgsh6vtw4odoiabhsfaqaktnfqzrjrspjuid.onion')
  }

  return str
}

/**
 * Replaces https://explorer.adamant.im URI to tor-explorer if host is .onion
 * @param {string} str String, that may contain https://explorer.adamant.im URI
 * @returns {string}
 */
export function explorerUriToOnion (str) {
  const hostname = window.location.origin
  if (hostname.includes('.onion')) {
    str = str.replace('https://explorer.adamant.im', 'http://srovpmanmrbmbqe63vp5nycsa3j3g6be3bz46ksmo35u5pw7jjtjamid.onion')
  }

  return str
}
