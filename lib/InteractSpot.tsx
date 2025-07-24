// Interact Web Page Spot
// Default configuration setting
import InteractAPI, { type InteractCommand } from "./InteractApi"

// Define proper typing for InteractAPI
interface InteractAPIWithCommandUtil {
  init: (config: { url: string }) => void
  CommandUtil: {
    createPostEventCmd: (event: string, data: NameValuePair[]) => InteractCommand
    createGetOffersCmd: (interactionPoint: string, maxOffers: number) => InteractCommand
    createStartSessionCmd: (
      icName: string,
      visitor: NameValuePair[],
      audLevel: string,
      sessionVars: NameValuePair[],
      relyOldSs: boolean,
      debug: boolean,
    ) => InteractCommand
    createSetAudienceCmd: (audience: NameValuePair[], audLevel: string, data: NameValuePair[]) => InteractCommand
    createGetProfileCmd: () => InteractCommand
  }
  Callback: {
    create: (successCallback: unknown, errorCallback: unknown) => unknown
  }
  execute: (commands: InteractCommand[], callback?: unknown) => void
  executeBatch: (sessionId: string, commands: InteractCommand[], callback?: unknown) => void
  postEvent: (sessionId: string, event: string, params: NameValuePair[] | null, callback: unknown) => void
  NameValuePair: {
    create: (name: string, value: unknown, type: string) => NameValuePair
    prototype: {
      TypeEnum: {
        NUMERIC: string
      }
    }
  }
}

// Type definitions
interface SpotConfig {
  event?: string
  eventVars?: string
  interactionPoint?: string
  maxNumOffers?: number
  renderFunction?: (spotId: string, response: InteractResponse) => void
}

interface AudienceConfig {
  audId?: string
  audLevel?: number
  serverUrl?: string
  visitorAudLvl?: number
  customerAudLvl?: number
  visitorAudID?: string
  acceptEvent?: string
  timeout?: number
  sessionCookie?: string
  startSession?: boolean
  newVisitor?: boolean
  setAudience?: boolean
  prevAudId?: string
  ssId?: string
  icName?: string
  visitorAltIDVar?: string
  sessVars?: string
  debug?: boolean
  idMgmt?: boolean
  prevAudIdVar?: string
  customerAud?: string
  customerAudType?: string
}

interface GlobalConfig extends AudienceConfig {
  [spotId: string]: SpotConfig | unknown
}

interface InteractResponse {
  responses?: ResponseItem[]
  batchStatusCode?: number
}

interface ResponseItem {
  profile?: ProfileItem[]
  messages?: MessageItem[]
}

interface ProfileItem {
  n: string
  v: string | number | boolean
}

interface MessageItem {
  msg: string
}

interface OfferAttribute {
  n: string
  v: string | number | boolean
}

interface NameValuePair {
  n: string
  v: string | number | boolean | null
  t: string
}

// Helper to safely access spot config
const getSpotConfig = (spotId: string): SpotConfig => {
  const config = confObj[spotId]
  return typeof config === "object" && config !== null ? (config as SpotConfig) : {}
}

let confObj: GlobalConfig = {}

// Utility functions
const logMsg = (message: string): void => {
  if (confObj.debug) {
    console.log("[InteractClient] " + message)
  }
}

const dummyCallback = (): void => undefined

const onError = (error: unknown): void => {
  logMsg("Error occurred: " + JSON.stringify(error))
}

const renderDefaultOffer = (): void => undefined

// Main functions
const postEventAndGetOffers = (spotId: string, aud?: AudienceConfig, conf?: SpotConfig): void => {
  updateConf(spotId, aud, conf)
  const spotConfig = getSpotConfig(spotId)

  if (confObj.serverUrl == null) {
    logMsg("Error: Interact server URL is not configured")
    return
  } else {
    ;(InteractAPI as unknown as InteractAPIWithCommandUtil).init({ url: confObj.serverUrl })
  }

  checkSession()

  const calls: InteractCommand[] = []
  sessionCalls(calls)

  calls.push(
    (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createPostEventCmd(
      spotConfig.event || "",
      getNameValuePairs(spotConfig.eventVars || "") || [],
    ),
  )

  calls.push(
    (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createGetOffersCmd(
      spotConfig.interactionPoint || "",
      spotConfig.maxNumOffers || 0,
    ),
  )

  const callback = (InteractAPI as unknown as InteractAPIWithCommandUtil).Callback.create(
    (response: InteractResponse) => {
      if (spotConfig.renderFunction) {
        spotConfig.renderFunction(spotId, response)
      }
    },
    renderDefaultOffer,
  )

  ;(InteractAPI as unknown as InteractAPIWithCommandUtil).executeBatch(confObj.ssId || "", calls, callback)
}

const postEvent = (spotId: string, aud?: AudienceConfig, conf?: SpotConfig): void => {
  updateConf(spotId, aud, conf)
  const spotConfig = getSpotConfig(spotId)

  if (confObj.serverUrl == null) {
    logMsg("Error: Interact server URL is not configured")
    return
  } else {
    ;(InteractAPI as unknown as InteractAPIWithCommandUtil).init({ url: confObj.serverUrl })
  }

  checkSession()

  const calls: InteractCommand[] = []
  sessionCalls(calls)

  calls.push(
    (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createPostEventCmd(
      spotConfig.event || "",
      getNameValuePairs(spotConfig.eventVars || "") || [],
    ),
  )

  const callback = (InteractAPI as unknown as InteractAPIWithCommandUtil).Callback.create(
    audienceSwitch,
    onErrorCallback,
  )

  ;(InteractAPI as unknown as InteractAPIWithCommandUtil).executeBatch(confObj.ssId || "", calls, callback)
}

const postAccept = (treatment: string): void => {
  logMsg("In AcceptEvent " + treatment)
  const callback = (InteractAPI as unknown as InteractAPIWithCommandUtil).Callback.create(dummyCallback, onError)

  checkSession()

  const calls: InteractCommand[] = []
  sessionCalls(calls)

  calls.push(
    (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createPostEventCmd(
      confObj.acceptEvent || "",
      getNameValuePairs(treatment) || [],
    ),
  )
  ;(InteractAPI as unknown as InteractAPIWithCommandUtil).executeBatch(confObj.ssId || "", calls, callback)
}

const postPresentEvent = (params: string): void => {
  logMsg("In ContactEvent " + params)
  const trackingCode = "UACIOfferTrackingCode," + params + ",string"

  const callback = (InteractAPI as unknown as InteractAPIWithCommandUtil).Callback.create(dummyCallback, onError)
  ;(InteractAPI as unknown as InteractAPIWithCommandUtil).postEvent(
    confObj.ssId || "",
    "contact",
    getNameValuePairs(trackingCode),
    callback,
  )
}

const getOffers = (spotId: string, aud?: AudienceConfig, conf?: SpotConfig): void => {
  updateConf(spotId, aud, conf)
  const spotConfig = getSpotConfig(spotId)

  if (confObj.serverUrl == null) {
    logMsg(" Error: Interact server URL is not configured")
    return
  } else {
    ;(InteractAPI as unknown as InteractAPIWithCommandUtil).init({ url: confObj.serverUrl })
  }

  checkSession()

  const calls: InteractCommand[] = []
  sessionCalls(calls)

  calls.push(
    (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createGetOffersCmd(
      spotConfig.interactionPoint || "",
      spotConfig.maxNumOffers || 0,
    ),
  )

  const callback = (InteractAPI as unknown as InteractAPIWithCommandUtil).Callback.create(
    (response: InteractResponse) => {
      if (spotConfig.renderFunction) {
        spotConfig.renderFunction(spotId, response)
      }
    },
    renderDefaultOffer,
  )

  ;(InteractAPI as unknown as InteractAPIWithCommandUtil).executeBatch(confObj.ssId || "", calls, callback)
}

const checkSession = (): void => {
  console.log("checkSession called with confObj.audId:", confObj.audId)
  if (!confObj.audId) {
    logMsg("Error: Audience ID is not configured")
    return
  }

  const currAudId = sessionStorage.getItem("audId")
  const isNewVisitor = !currAudId && confObj.audLevel === confObj.visitorAudLvl
  const formattedAudId = confObj.audId.replaceAll(",", "|")

  if (!currAudId) {
    sessionStorage.setItem("audId", formattedAudId)
    confObj.startSession = true
    confObj.newVisitor = isNewVisitor
    return
  }

  const restoredAudId = currAudId.replaceAll("|", ",")
  if (restoredAudId !== confObj.audId) {
    const [currKey, audKey, visitorKey] = [
      restoredAudId.split(",")[0],
      confObj.audId.split(",")[0],
      confObj.visitorAudID ? confObj.visitorAudID.split(",")[0] : "",
    ]

    if (audKey === visitorKey && currKey !== visitorKey) {
      confObj.audId = restoredAudId
      confObj.audLevel = confObj.customerAudLvl
    } else {
      confObj.setAudience = true
      confObj.prevAudId = restoredAudId
      sessionStorage.setItem("audId", formattedAudId)
    }
  }

  const savedSess = sessionStorage.getItem("ssId")
  const savedTime = sessionStorage.getItem("ssTs")
  const currentTime = new Date().getTime()

  if (!savedSess || (savedTime && currentTime - parseInt(savedTime) > 1000 * 60 * (confObj.timeout || 30))) {
    const sessionId = confObj.sessionCookie || `${formattedAudId}${currentTime}`
    console.log("Generating new session ID:", {
      sessionCookie: confObj.sessionCookie,
      formattedAudId,
      currentTime,
      generatedSessionId: sessionId,
    })
    confObj.ssId = sessionId
    sessionStorage.setItem("ssId", confObj.ssId)
    sessionStorage.setItem("ssTs", currentTime.toString())
    confObj.startSession = true
  } else {
    confObj.ssId = savedSess
    sessionStorage.setItem("ssTs", currentTime.toString())
  }
}

const sessionCalls = (calls: InteractCommand[]): void => {
  if (confObj.startSession) {
    const relyOldSs = true
    const audParts = confObj.audId ? confObj.audId.split(",") : []

    if (confObj.newVisitor) {
      const altID = `${confObj.visitorAltIDVar},${audParts[1] || ""},${audParts[2] || ""}`
      calls.push(
        (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createStartSessionCmd(
          confObj.icName || "",
          getNameValuePairs(confObj.visitorAudID || "") || [],
          String(confObj.visitorAudLvl || ""),
          getNameValuePairs(`${altID};${confObj.sessVars || ""}`) || [],
          relyOldSs,
          confObj.debug || false,
        ),
      )

      calls.push(
        (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createSetAudienceCmd(
          getNameValuePairs(confObj.audId || "") || [],
          String(confObj.audLevel || ""),
          getNameValuePairs("") || [],
        ),
      )

      if (confObj.idMgmt) {
        calls.push((InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createGetProfileCmd())
      }
    } else {
      calls.push(
        (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createStartSessionCmd(
          confObj.icName || "",
          getNameValuePairs(confObj.audId || "") || [],
          String(confObj.audLevel || ""),
          getNameValuePairs(confObj.sessVars || "") || [],
          relyOldSs,
          confObj.debug || false,
        ),
      )
    }
  } else if (confObj.setAudience) {
    const parms = confObj.prevAudIdVar
      ? `${confObj.prevAudIdVar},${confObj.prevAudId ? confObj.prevAudId.replaceAll(",", "|") : ""},string`
      : ""

    calls.push(
      (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createSetAudienceCmd(
        getNameValuePairs(confObj.audId || "") || [],
        String(confObj.audLevel || ""),
        getNameValuePairs(parms) || [],
      ),
    )

    if (confObj.idMgmt) {
      calls.push((InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createGetProfileCmd())
    }
  }
}

const audienceSwitch = (response: InteractResponse): void => {
  const respList = response.responses

  if (respList) {
    respList.forEach((responseItem: ResponseItem) => {
      if (responseItem.profile) {
        const profileList = responseItem.profile
        logMsg("Reading profile")

        const profile = profileList.find((p: ProfileItem) => p.n === confObj.customerAud)
        if (profile && profile.v.toString().length > 1) {
          const audID = `${confObj.customerAud},${profile.v},${confObj.customerAudType}`
          const calls = [
            (InteractAPI as unknown as InteractAPIWithCommandUtil).CommandUtil.createSetAudienceCmd(
              getNameValuePairs("") || [],
              String(confObj.customerAudLvl || ""),
              getNameValuePairs(audID) || [],
            ),
          ]

          const callback = (InteractAPI as unknown as InteractAPIWithCommandUtil).Callback.create(
            dummyCallback,
            onErrorCallback,
          )
          ;(InteractAPI as unknown as InteractAPIWithCommandUtil).executeBatch(confObj.ssId || "", calls, callback)
        }
      }
    })
  }
}

const getOfferAttrValue = (offerAttrs: OfferAttribute[], offerName: string): string | number | boolean => {
  const foundOffer = offerAttrs.find(attr => attr.n.toLowerCase() === offerName.toLowerCase())
  return foundOffer ? foundOffer.v : ""
}

const getNameValuePairs = (parameters: string): NameValuePair[] | null => {
  if (parameters === "") return null

  return parameters.split(";").map(part => {
    const nvp1 = part.split(",")
    const nvp: [string, string | number | boolean | null, string] = [nvp1[0], null, nvp1[nvp1.length - 1]]

    // Combine the middle parts of nvp1 to form the value
    const value = nvp1.slice(1, -1).join(",")

    // Handle numeric type
    if (
      nvp[2] === (InteractAPI as unknown as InteractAPIWithCommandUtil).NameValuePair.prototype.TypeEnum.NUMERIC &&
      !isNaN(Number(value))
    ) {
      nvp[1] = Number(value)
    } else {
      nvp[1] = value
    }

    // Special handling for NULL value
    if (nvp[1] && typeof nvp[1] === "string" && nvp[1].toUpperCase() === "NULL") {
      nvp[1] = null
    }

    return (InteractAPI as unknown as InteractAPIWithCommandUtil).NameValuePair.create(nvp[0], nvp[1], nvp[2])
  })
}

const onErrorCallback = (response: InteractResponse): void => {
  const respList = response.responses

  if (response.batchStatusCode && response.batchStatusCode > 0) {
    logMsg("API call(s) failed")
    if (respList) {
      respList.forEach((resp: ResponseItem) => {
        if (resp.messages) {
          resp.messages.forEach((message: MessageItem) => logMsg("   " + message.msg))
        }
      })
    }
    sessionStorage.setItem("ssTs", "0")
    return
  }
}

const updateConf = (spotId: string, aud?: AudienceConfig, conf?: SpotConfig): void => {
  if (aud) {
    Object.keys(aud).forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(confObj as any)[key] = (aud as any)[key]
    })
  }
  if (conf) {
    confObj[spotId] = conf
  }
}

const setConfig = (config: GlobalConfig): void => {
  confObj = config
}

export {
  audienceSwitch,
  checkSession,
  dummyCallback,
  getNameValuePairs,
  getOfferAttrValue,
  getOffers,
  logMsg,
  onErrorCallback,
  postAccept,
  postEvent,
  postEventAndGetOffers,
  postPresentEvent,
  sessionCalls,
  setConfig,
  updateConf,
}

// Export types for external use
export type {
  SpotConfig,
  AudienceConfig,
  GlobalConfig,
  InteractResponse,
  ResponseItem,
  ProfileItem,
  MessageItem,
  OfferAttribute,
}
