export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname !== "/api/network-status") {
      return new Response("Not Found", { status: 404 })
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      })
    }

    try {
      const debugMode = isDebugMode(env)
      const clientIp = request.headers.get("CF-Connecting-IP") || ""
      const ipinfo = await getIpinfo(clientIp, env.IPINFO_TOKEN)
      const asn = normalizeAsn(ipinfo)
      const radar = await getRadarStatus(asn, env.CLOUDFLARE_API_TOKEN, env.RADAR_API_URL)

      const payload = {
        ip: ipinfo.ip || clientIp || null,
        isp: ipinfo.org || ipinfo.isp || ipinfo.asnName || null,
        asn,
        trafficStatus: radar.trafficStatus,
        trafficGrade: radar.trafficGrade || null,
        ipv6Ratio: radar.ipv6Ratio ?? null,
        ipv4Ratio: radar.ipv4Ratio ?? null,
        radarSource: radar.source,
        updatedAt: new Date().toISOString()
      }

      if (debugMode) {
        payload.radarHttpStatus = radar.httpStatus || null
        payload.radarError = radar.error || null
        payload.radarEndpoint = radar.endpoint || null
      }

      return json(payload, request)
    } catch (error) {
      return json(
        {
          ip: null,
          isp: null,
          trafficStatus: "데이터 조회 실패",
          error: String(error?.message || error),
          updatedAt: new Date().toISOString()
        },
        request,
        200
      )
    }
  }
}

function isDebugMode(env) {
  return String(env?.NETWORK_DEBUG || "").toLowerCase() === "1" ||
    String(env?.NETWORK_DEBUG || "").toLowerCase() === "true"
}

async function getIpinfo(clientIp, token) {
  if (!token) {
    throw new Error("Missing IPINFO_TOKEN")
  }

  const endpoint = clientIp
    ? `https://ipinfo.io/${clientIp}?token=${encodeURIComponent(token)}`
    : `https://ipinfo.io/json?token=${encodeURIComponent(token)}`

  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error("ipinfo request failed")
  }

  return response.json()
}

function normalizeAsn(ipinfoData) {
  if (ipinfoData?.asn?.asn) {
    return ipinfoData.asn.asn
  }

  const org = ipinfoData?.org || ""
  const match = org.match(/(AS\d+)/i)
  return match ? match[1].toUpperCase() : null
}

async function getRadarStatus(asn, cloudflareToken, radarApiUrl) {
  if (!asn || !cloudflareToken) {
    return {
      trafficStatus: "Radar 데이터 미설정",
      source: "none",
      endpoint: null
    }
  }

  const asnNumber = normalizeAsnNumber(asn)

  // Radar endpoint may vary by API version. Override with RADAR_API_URL if needed.
  // Default uses an endpoint documented in Radar HTTP requests APIs.
  const base =
    radarApiUrl ||
    "https://api.cloudflare.com/client/v4/radar/http/summary/ip_version?name=ip_version&dateRange=1d&format=json"
  const radarUrl = `${base}${base.includes("?") ? "&" : "?"}asn=${encodeURIComponent(asnNumber || asn)}`

  const response = await fetch(radarUrl, {
    headers: {
      Authorization: `Bearer ${cloudflareToken}`,
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    let details = ""
    try {
      details = (await response.text()).slice(0, 300)
    } catch {
      details = ""
    }

    return {
      trafficStatus: "Radar 조회 실패",
      source: "radar",
      httpStatus: response.status,
      error: details || `HTTP ${response.status}`,
      endpoint: radarUrl
    }
  }

  const data = await response.json()
  const metrics = getTrafficMetricsFromRadar(data)
  const status = getTrafficStatusFromRadar(data, metrics)

  return {
    trafficStatus: status || "Radar 데이터 정상",
    trafficGrade: metrics?.grade || null,
    ipv6Ratio: metrics?.ipv6Ratio ?? null,
    ipv4Ratio: metrics?.ipv4Ratio ?? null,
    source: "radar",
    httpStatus: response.status,
    endpoint: radarUrl
  }
}

function normalizeAsnNumber(asn) {
  if (asn == null) {
    return null
  }

  const text = String(asn).trim()
  const match = text.match(/^(?:AS)?(\d+)$/i)
  return match ? match[1] : text
}

function getTrafficStatusFromRadar(data, metrics) {
  const result = data?.result
  if (!result || typeof result !== "object") {
    return null
  }

  if (metrics?.statusText) {
    return metrics.statusText
  }

  const direct = result.summary || result.status
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim()
  }

  return null
}

function getTrafficMetricsFromRadar(data) {
  const result = data?.result
  if (!result || typeof result !== "object") {
    return null
  }

  const ipv6 = findMetricValueByKey(result, /ipv6/i)
  const ipv4 = findMetricValueByKey(result, /ipv4/i)
  return buildTrafficMetrics(ipv6, ipv4)
}

function buildTrafficMetrics(ipv6, ipv4) {
  const v6 = toFiniteNumber(ipv6)
  const v4 = toFiniteNumber(ipv4)

  if (v6 == null && v4 == null) {
    return null
  }

  const ipv6Ratio = clampPercent(v6 != null ? v6 : 100 - v4)
  const ipv4Ratio = clampPercent(v4 != null ? v4 : 100 - ipv6Ratio)
  const grade = ipv6Ratio >= 65 ? "IPv6 우세" : ipv6Ratio <= 35 ? "IPv4 우세" : "균형형"

  return {
    grade,
    ipv6Ratio,
    ipv4Ratio,
    statusText: `${grade} (IPv6 ${formatPercent(ipv6Ratio)})`
  }
}

function clampPercent(value) {
  if (!Number.isFinite(value)) {
    return 0
  }
  if (value < 0) {
    return 0
  }
  if (value > 100) {
    return 100
  }
  return value
}

function findMetricValueByKey(value, keyRegex) {
  if (value == null) {
    return null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findMetricValueByKey(item, keyRegex)
      if (nested != null) {
        return nested
      }
    }
    return null
  }

  if (typeof value !== "object") {
    return null
  }

  for (const [key, item] of Object.entries(value)) {
    if (keyRegex.test(key)) {
      const parsed = toFiniteNumber(item)
      if (parsed != null) {
        return parsed
      }
    }

    const nested = findMetricValueByKey(item, keyRegex)
    if (nested != null) {
      return nested
    }
  }

  return null
}

function toFiniteNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const num = Number.parseFloat(value)
    return Number.isFinite(num) ? num : null
  }

  return null
}

function formatPercent(value) {
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value))
  if (!Number.isFinite(numeric)) {
    return "-"
  }

  return `${numeric.toFixed(2)}%`
}

function json(payload, request, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request)
    }
  })
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*"
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store"
  }
}
