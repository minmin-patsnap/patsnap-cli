/**
 * @author min.min
 * @date 2026/3/27
 */
import axios from "axios"
import * as forge from "node-forge"
import { getToken } from "./auth.js"

const PASSPORT_BASE_URL = process.env.PATSNAP_API_URL ?? "https://passport.patsnap.com"
const OPEN_SERVICE_BASE_URL = process.env.PATSNAP_OPEN_SERVICE_URL ?? "https://open-service.patsnap.com"

// RSA public key for password encryption
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmEFWbIeixJuYXxEmeekjMU9i0
39cJOQ9s5pOkuLC5TYzUAuv6kcD4VIFY4Vj/Z/laIoH3QO+Y0CLpQdsAv+OXDIq8
ILOYHJTo0uCio9l4a4mUJJUWrspgITPVvV8xLpjVDrD2Z1lyvJHQHGCw7ujVTH2u
dn7d85N/yy5ovc+LZQIDAQAB
-----END PUBLIC KEY-----`

export function encryptPassword(password: string): string {
  const publicKey = forge.pki.publicKeyFromPem(RSA_PUBLIC_KEY)
  const encrypted = publicKey.encrypt(password, "RSAES-PKCS1-V1_5")
  return forge.util.encode64(encrypted)
}

export const passportApi = axios.create({
  baseURL: PASSPORT_BASE_URL,
  headers: {
    "content-type": "application/json",
    "x-api-version": "1.0",
    "x-patsnap-from": "openapi-ai-inside",
  },
})

export async function authedRequest() {
  const token = await getToken()
  if (!token) throw new Error("Not logged in. Run: patsnap login")
  return axios.create({
    baseURL: OPEN_SERVICE_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  })
}
