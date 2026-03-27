/**
 * @author min.min
 * @date 2026/3/27
 */
import axios from "axios"
import { getToken } from "./auth.js"

const BASE_URL = process.env.PATSNAP_API_URL ?? "https://passport.patsnap.com"

export const passportApi = axios.create({ baseURL: BASE_URL })

export async function authedRequest() {
  const token = await getToken()
  if (!token) throw new Error("Not logged in. Run: patsnap login")
  return axios.create({
    baseURL: process.env.PATSNAP_OPENAPI_URL ?? "https://openapi.patsnap.com",
    headers: { Authorization: `Bearer ${token}` },
  })
}
