/* eslint-disable */

// Type definitions
interface Config {
  url: string
  enableLog?: string
  endSession?: boolean
  m_user_name?: string
  m_user_password?: string
}

interface Callback {
  successCb?: (response: any) => void
  failureCb?: (error: any) => void
}

interface NameValuePairData {
  n: string
  v: any
  t: string
}

interface AdvisoryMessageData {
  msgLevel: number
  msg: string
  detailMsg: string
  msgCode: string
}

interface OfferData {
  n: string
  code: string
  treatmentCode: string
  score: number
  desc: string
  attributes: NameValuePairData[]
}

interface OfferListData {
  ip: string
  defaultString: string
  offers: OfferData[]
}

interface ResponseData {
  sessionId: string
  statusCode: number
  offerLists: OfferListData[]
  profile: NameValuePairData[]
  version: string
  advisoryMessages: AdvisoryMessageData[]
  trackingCode: string
  messages?: any[]
}

interface InteractCommand {
  command: string
  [key: string]: any
}

interface CommandUtilInterface {
  createGetVersionCmd: () => InteractCommand
  createEndSessionCmd: () => InteractCommand
  createGetOffersCmd: (ip: string, data: number) => InteractCommand
  createGetOffersForMultipleInteractionPointsCmd: (data: any) => InteractCommand
  createGetProfileCmd: () => InteractCommand
  createPostEventCmd: (event: string, data: NameValuePairData[]) => InteractCommand
  createSetDebugCmd: (debug: boolean) => InteractCommand
  createSetAudienceCmd: (audience: NameValuePairData[], level: string, data: NameValuePairData[]) => InteractCommand
  createStartSessionCmd: (
    session: string,
    visitor: NameValuePairData[],
    data: string,
    options: NameValuePairData[],
    profile: boolean,
    events: boolean,
  ) => InteractCommand
}

interface BatchResponseData {
  batchStatusCode: string
  responses: ResponseData[]
}

interface CommandData {
  sessionId?: string
  commands: any[]
}

// Main InteractAPI implementation
const InteractAPI = (function () {
  // Internal utility functions
  function Q(this: any, R: Config) {
    this.config = R
  }

  function E(R: Config): boolean {
    if (R && R.enableLog && R.enableLog === "true") {
      return true
    } else {
      return false
    }
  }

  function A(this: any, T: Callback, S: any) {
    if (T && typeof T.successCb === "function") {
      const R = this.ResponseTransUtil.buildAPIResponse(S)
      T.successCb(R ? R : S)
    }
  }

  function K(S: Callback, R: any) {
    if (S && typeof S.failureCb === "function") {
      S.failureCb(R)
    }
  }

  function O(this: any, V: string, W: Callback) {
    const U = this
    const S = new XMLHttpRequest()
    const R = U.config.url + "/servlet/RestServlet"
    S.open("POST", R, true)
    S.setRequestHeader("Content-type", "application/json; charset=utf-8")

    if (V.indexOf("endSession") > -1) {
      U.config.endSession = true
    }

    const T = L("m_tokenId")
    if (T) {
      S.setRequestHeader("m_tokenId", T)
    } else {
      if (U.config.m_user_name) {
        S.setRequestHeader("m_user_name", encodeURIComponent(U.config.m_user_name))
        S.setRequestHeader("m_user_password", encodeURIComponent(U.config.m_user_password))
      }
    }

    S.onreadystatechange = function () {
      if (S.readyState === 4) {
        P("m_tokenId", S.getResponseHeader("m_tokenId"), U.config.endSession)
        let Y: any = null
        let Z: string | null = null

        if (typeof S.response === "string") {
          Z = S.response
        } else {
          if (typeof S.responseText !== "undefined") {
            Z = S.responseText
          }
        }

        if (Z) {
          try {
            Y = JSON.parse(Z)
          } catch (X) {
            Y = Z
          }
        }

        if (!Y) {
          Y = S.response
        }

        if (S.status === 200) {
          if (E(U.config)) {
            console.log("Executing commands: " + JSON.stringify(S.responseText))
          }
          A.call(U, W, Y)
        } else {
          if (E(U.config)) {
            console.error("Executing commands: " + JSON.stringify(S.responseText))
          }
          K.call(U, W, Y)
        }
      }
    }

    S.send(V)
    if (E(U.config)) {
      console.log("Executing commands: " + JSON.stringify(V))
    }
  }

  function F(this: any, S: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createGetVersionCmd()
    this.executeBatch(null, R, (InteractAPI as any).FirstResponseCallback.create(S))
  }

  function N(this: any, S: string, T: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createEndSessionCmd()
    this.executeBatch(S, R, (InteractAPI as any).FirstResponseCallback.create(T))
  }

  function I(this: any, S: string, R: any[], T: Callback) {
    this.executeCmd(JSON.stringify({ sessionId: S, commands: R }), T)
  }

  function H(this: any, U: string, T: string, S: any, V: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createGetOffersCmd(T, S)
    this.executeBatch(U, R, (InteractAPI as any).FirstResponseCallback.create(V))
  }

  function G(this: any, T: string, S: any, U: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createGetOffersForMultipleInteractionPointsCmd(S)
    this.executeBatch(T, R, (InteractAPI as any).FirstResponseCallback.create(U))
  }

  function C(this: any, S: string, T: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createGetProfileCmd()
    this.executeBatch(S, R, (InteractAPI as any).FirstResponseCallback.create(T))
  }

  function D(this: any, U: string, S: any, T: any, V: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createPostEventCmd(S, T)
    this.executeBatch(U, R, (InteractAPI as any).FirstResponseCallback.create(V))
  }

  function J(this: any, T: string, S: any, U: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createSetDebugCmd(S)
    this.executeBatch(T, R, (InteractAPI as any).FirstResponseCallback.create(U))
  }

  function M(this: any, V: string, U: any, S: any, T: any, W: Callback) {
    const R = new Array(1)
    R[0] = this.CommandUtil.createSetAudienceCmd(U, S, T)
    this.executeBatch(V, R, (InteractAPI as any).FirstResponseCallback.create(W))
  }

  function B(this: any, W: string, U: any, V: any, S: any, Z: any, Y: any, R: any, X: Callback) {
    const T = new Array(1)
    T[0] = this.CommandUtil.createStartSessionCmd(U, V, S, Z, Y, R)
    this.executeBatch(W, T, (InteractAPI as any).FirstResponseCallback.create(X))
  }

  function P(V: string, T: string | null, U?: boolean) {
    if (T !== null && !U) {
      const S = new Date()
      S.setTime(S.getTime() + 15 * 60 * 1000)
      const R = "expires=" + S.toUTCString()
      document.cookie = V + "=" + T + ";" + R + ";path=/interact/"
    } else {
      const S = new Date()
      S.setTime(S.getTime() - 24 * 60 * 60 * 1000)
      const R = "expires=" + S.toUTCString()
      document.cookie = V + "=" + (T || "") + ";" + R + ";path=/interact/"
    }
  }

  function L(V: string): string {
    const T = V + "="
    const R = document.cookie.split(";")
    for (let U = 0; U < R.length; U++) {
      let S = R[U]
      while (S.charAt(0) === " ") {
        S = S.substring(1)
      }
      if (S.indexOf(T) === 0) {
        return S.substring(T.length, S.length)
      }
    }
    return ""
  }

  return {
    init: Q,
    executeCmd: O,
    getVersion: F,
    endSession: N,
    executeBatch: I,
    getOffers: H,
    getOffersForMultipleInteractionPoints: G,
    getProfile: C,
    postEvent: D,
    setDebug: J,
    setAudience: M,
    startSession: B,
  }
})()

// Namespace function
;(InteractAPI as any).namespace = function (D: string) {
  const C = D.split(".")
  let B: any = InteractAPI
  let A: number

  if (C[0] === "InteractAPI") {
    C.shift()
  }

  for (A = 0; A < C.length; A += 1) {
    if (B[C[A]] === undefined) {
      B[C[A]] = {}
    }
    B = B[C[A]]
  }
  return B
}

// NameValuePair class
;(InteractAPI as any).namespace("InteractAPI.NameValuePair")

class NameValuePair {
  n: string
  v: any
  t: string

  static TypeEnum = {
    STRING: "string",
    NUMERIC: "numeric",
    DATETIME: "datetime",
  }

  constructor() {
    this.n = ""
    this.v = ""
    this.t = ""
  }

  static create(D: string, A: any, B: string): NameValuePair {
    const C = new NameValuePair()
    C.n = D
    C.v = A
    C.t = B
    return C
  }

  getName(): string {
    return this.n
  }

  getValue(): any {
    return this.v
  }

  getType(): string {
    return this.t
  }
}

;(InteractAPI as any).NameValuePair = NameValuePair

// AdvisoryMessage class
;(InteractAPI as any).namespace("InteractAPI.AdvisoryMessage")

class AdvisoryMessage {
  msgLevel: number
  msg: string
  detailMsg: string
  msgCode: string

  static StatusLevelEnum = {
    INFO: 0,
    WARNING: 1,
    ERROR: 2,
  }

  constructor() {
    this.msgLevel = 0
    this.msg = ""
    this.detailMsg = ""
    this.msgCode = ""
  }

  static create(A: number, E: string, D: string, B: string): AdvisoryMessage {
    const C = new AdvisoryMessage()
    C.msgLevel = A
    C.msg = E
    C.detailMsg = D
    C.msgCode = B
    return C
  }

  getStatusLevel(): number {
    return this.msgLevel
  }

  getMessage(): string {
    return this.msg
  }

  getDetailedMessage(): string {
    return this.detailMsg
  }

  getMessageCode(): string {
    return this.msgCode
  }
}

;(InteractAPI as any).AdvisoryMessage = AdvisoryMessage

// Offer class
;(InteractAPI as any).namespace("InteractAPI.Offer")

class Offer {
  n: string
  code: string
  treatmentCode: string
  score: number
  desc: string
  attributes: NameValuePair[]

  constructor() {
    this.n = ""
    this.code = ""
    this.treatmentCode = ""
    this.score = 0
    this.desc = ""
    this.attributes = []
  }

  static create(G: string, C: string, A: string, F: number, E: string, B: NameValuePair[]): Offer {
    const D = new Offer()
    D.n = G
    D.code = C
    D.treatmentCode = A
    D.score = F
    D.desc = E
    D.attributes = B
    return D
  }

  getOfferName(): string {
    return this.n
  }

  getOfferCode(): string {
    return this.code
  }

  getTreatmentCode(): string {
    return this.treatmentCode
  }

  getScore(): number {
    return this.score
  }

  getDescription(): string {
    return this.desc
  }

  getAttributes(): NameValuePair[] {
    return this.attributes
  }
}

;(InteractAPI as any).Offer = Offer

// OfferList class
;(InteractAPI as any).namespace("InteractAPI.OfferList")

class OfferList {
  ip: string
  defaultString: string
  offers: Offer[]

  constructor() {
    this.ip = ""
    this.defaultString = ""
    this.offers = []
  }

  static create(D: string, A: string, B: Offer[]): OfferList {
    const C = new OfferList()
    C.ip = D
    C.defaultString = A
    C.offers = B
    return C
  }

  getInteractionPointName(): string {
    return this.ip
  }

  getDefaultString(): string {
    return this.defaultString
  }

  getOffers(): Offer[] {
    return this.offers
  }
}

;(InteractAPI as any).OfferList = OfferList

// Response class
;(InteractAPI as any).namespace("InteractAPI.Response")

class Response {
  sessionId: string
  statusCode: number
  offerLists: OfferList[]
  profile: NameValuePair[]
  version: string
  messages: AdvisoryMessage[]

  constructor() {
    this.sessionId = ""
    this.statusCode = 0
    this.offerLists = []
    this.profile = []
    this.version = ""
    this.messages = []
  }

  static create(F: string, C: number, A: OfferList[], B: NameValuePair[], E: string, D: AdvisoryMessage[]): Response {
    const G = new Response()
    G.sessionId = F
    G.statusCode = C
    G.offerLists = A
    G.profile = B
    G.version = E
    G.messages = D
    return G
  }

  getSessionId(): string {
    return this.sessionId
  }

  getStatusCode(): number {
    return this.statusCode
  }

  getOfferLists(): OfferList[] {
    return this.offerLists
  }

  getProfile(): NameValuePair[] {
    return this.profile
  }

  getVersion(): string {
    return this.version
  }

  getAdvisoryMessages(): AdvisoryMessage[] {
    return this.messages
  }
}

;(InteractAPI as any).Response = Response

// BatchResponse class
;(InteractAPI as any).namespace("InteractAPI.BatchResponse")

class BatchResponse {
  batchStatusCode: string
  responses: Response[]

  constructor() {
    this.batchStatusCode = ""
    this.responses = []
  }

  static create(A: string, B: Response[]): BatchResponse {
    const C = new BatchResponse()
    C.batchStatusCode = A
    C.responses = B
    return C
  }

  getBatchStatusCode(): string {
    return this.batchStatusCode
  }

  getResponses(): Response[] {
    return this.responses
  }
}

;(InteractAPI as any).BatchResponse = BatchResponse

// FirstResponseCallback utility
;(InteractAPI as any).namespace("InteractAPI.FirstResponseCallback")

class FirstResponseCallback {
  callback: Callback

  constructor() {
    this.callback = {}
  }

  static create(A: Callback): FirstResponseCallback {
    const B = new FirstResponseCallback()
    B.callback = A
    return B
  }

  successCb = (A: BatchResponse | Response) => {
    if (this.callback && typeof this.callback.successCb === "function") {
      if (A instanceof BatchResponse) {
        const B = A.getResponses()
        if (B && B.length > 0) {
          this.callback.successCb(B[0])
        } else {
          this.callback.successCb(null)
        }
      } else {
        this.callback.successCb(A)
      }
    }
  }

  failureCb = (A: any) => {
    if (this.callback && typeof this.callback.failureCb === "function") {
      this.callback.failureCb(A)
    }
  }
}

;(InteractAPI as any).FirstResponseCallback = FirstResponseCallback

// Simple Callback utility
class SimpleCallback {
  successCb?: (response: any) => void
  failureCb?: (error: any) => void

  constructor(successCb?: (response: any) => void, failureCb?: (error: any) => void) {
    this.successCb = successCb
    this.failureCb = failureCb
  }

  static create(successCb?: (response: any) => void, failureCb?: (error: any) => void): SimpleCallback {
    return new SimpleCallback(successCb, failureCb)
  }
}

;(InteractAPI as any).Callback = SimpleCallback

// NameValuePair utility
const NameValuePairUtil = {
  TypeEnum: {
    NUMERIC: "numeric",
    STRING: "string",
    BOOLEAN: "boolean",
  },

  create(name: string, value: any, type: string): { n: string; v: any; t: string } {
    return { n: name, v: value, t: type }
  },

  prototype: {
    TypeEnum: {
      NUMERIC: "numeric",
      STRING: "string",
      BOOLEAN: "boolean",
    },
  },
}

;(InteractAPI as any).NameValuePair = NameValuePairUtil

// Command utilities and other supporting classes would go here...
// For brevity, I'll add the essential ResponseTransUtil
;(InteractAPI as any).namespace("InteractAPI.ResponseTransUtil")

const ResponseTransUtil = {
  _buildAdvisoryMessage(A: AdvisoryMessageData): AdvisoryMessage | null {
    if (!A) {
      return null
    }
    return AdvisoryMessage.create(A.msgLevel, A.msg, A.detailMsg, A.msgCode)
  },

  _buildOffer(C: OfferData): Offer | null {
    if (!C) {
      return null
    }
    let B: NameValuePair[] | null = null
    if (C.attributes) {
      B = []
      for (let D = 0; D < C.attributes.length; D++) {
        const A = this._buildNameValuePair(C.attributes[D])
        if (A) {
          B.push(A)
        }
      }
    }
    return Offer.create(C.n, C.code, C.treatmentCode, C.score, C.desc, B || [])
  },

  _buildOfferList(D: OfferListData): OfferList | null {
    if (!D) {
      return null
    }
    let C: Offer[] | null = null
    if (D.offers) {
      C = []
      for (let B = 0; B < D.offers.length; B++) {
        const A = this._buildOffer(D.offers[B])
        if (A) {
          C.push(A)
        }
      }
    }
    return OfferList.create(D.ip, D.defaultString, C || [])
  },

  _buildNameValuePair(A: NameValuePairData): NameValuePair | null {
    if (!A) {
      return null
    } else {
      return NameValuePair.create(A.n, A.v, A.t)
    }
  },

  _buildResponse(C: ResponseData): Response | null {
    if (!C) {
      return null
    }
    let J: OfferList[] | null = null
    if (C.offerLists) {
      J = []
      for (let F = 0; F < C.offerLists.length; F++) {
        const E = this._buildOfferList(C.offerLists[F])
        if (E) {
          J.push(E)
        }
      }
    }
    let D: AdvisoryMessage[] | null = null
    if (C.messages) {
      D = []
      for (let G = 0; G < C.messages.length; G++) {
        const A = this._buildAdvisoryMessage(C.messages[G])
        if (A) {
          D.push(A)
        }
      }
    }
    let B: NameValuePair[] | null = null
    if (C.profile) {
      B = []
      for (let H = 0; H < C.profile.length; H++) {
        const I = this._buildNameValuePair(C.profile[H])
        if (I) {
          B.push(I)
        }
      }
    }
    return Response.create(C.sessionId, C.statusCode, J || [], B || [], C.version, D || [])
  },

  _buildBatchResponse(B: BatchResponseData): BatchResponse | null {
    if (!B) {
      return null
    }
    let C: Response[] | null = null
    if (B.responses) {
      C = []
      for (let A = 0; A < B.responses.length; A++) {
        const D = this._buildResponse(B.responses[A])
        if (D) {
          C.push(D)
        }
      }
    }
    return BatchResponse.create(B.batchStatusCode, C || [])
  },

  buildAPIResponse(A: any): BatchResponse | Response | null {
    if (!A) {
      return null
    }
    if (A.batchStatusCode !== undefined) {
      return this._buildBatchResponse(A)
    } else {
      return this._buildResponse(A)
    }
  },
}

;(InteractAPI as any).ResponseTransUtil = ResponseTransUtil

// Add other utility classes as needed...
;(InteractAPI as any).CommandUtil = {
  createGetVersionCmd: () => ({ command: "getVersion" }),
  createEndSessionCmd: () => ({ command: "endSession" }),
  createGetOffersCmd: (ip: string, data: any) => ({ command: "getOffers", interactionPoint: ip, data }),
  createGetOffersForMultipleInteractionPointsCmd: (data: any) => ({
    command: "getOffersForMultipleInteractionPoints",
    data,
  }),
  createGetProfileCmd: () => ({ command: "getProfile" }),
  createPostEventCmd: (event: any, data: any) => ({ command: "postEvent", event, data }),
  createSetDebugCmd: (debug: any) => ({ command: "setDebug", debug }),
  createSetAudienceCmd: (audience: any, level: any, data: any) => ({ command: "setAudience", audience, level, data }),
  createStartSessionCmd: (session: any, visitor: any, data: any, options: any, profile: any, events: any) => ({
    command: "startSession",
    session,
    visitor,
    data,
    options,
    profile,
    events,
  }),
}

export default InteractAPI
export type {
  NameValuePairData,
  AdvisoryMessageData,
  OfferData,
  OfferListData,
  ResponseData,
  InteractCommand,
  CommandUtilInterface,
}
