// Interact Web Page Spot
// Default configuration setting
import InteractAPI from "./InteractApi"

let confObj = {}

const postEventAndGetOffers = (spotId, aud, conf) => {
  // Set global config
  // debugger;
  updateConf(spotId, aud, conf)

  if (confObj.serverUrl == null) {
    logMsg("Error: Interact server URL is not configured")
    return
  } else {
    InteractAPI.init({ url: confObj.serverUrl })
  }
  // Setup the sequence of API calls
  checkSession()

  const calls = []
  // Setup API call sequence

  sessionCalls(calls)
  // Add postEvent to call sequence
  calls.push(
    InteractAPI.CommandUtil.createPostEventCmd(confObj[spotId].event, getNameValuePairs(confObj[spotId].eventVars)),
  )

  // Add getOffers to call sequence
  calls.push(InteractAPI.CommandUtil.createGetOffersCmd(confObj[spotId].interactionPoint, confObj[spotId].maxNumOffers))

  // Add callback to render offers
  const callback = InteractAPI.Callback.create(response => {
    confObj[spotId].renderFunction(spotId, response)
  }, renderDefaultOffer)

  // Execute Interact batch
  InteractAPI.executeBatch(confObj.ssId, calls, callback)
}

const postEvent = (spotId, aud, conf) => {
  // Set global config
  // debugger;
  updateConf(spotId, aud, conf)

  if (confObj.serverUrl == null) {
    logMsg("Error: Interact server URL is not configured")
    return
  } else {
    InteractAPI.init({ url: confObj.serverUrl })
  }
  // Setup the sequence of API calls
  checkSession()

  const calls = []
  // Setup API call sequence

  sessionCalls(calls)
  // Add postEvent to call sequence
  calls.push(
    InteractAPI.CommandUtil.createPostEventCmd(confObj[spotId].event, getNameValuePairs(confObj[spotId].eventVars)),
  )

  // Add dummy callbacks
  const callback = InteractAPI.Callback.create(audienceSwitch, onErrorCallback)

  // Execute Interact batch
  InteractAPI.executeBatch(confObj.ssId, calls, callback)
}

const postAccept = treatment => {
  logMsg("In AcceptEvent " + treatment)
  // const trackingCode = "UACIOfferTrackingCode," + treatment + ",string"
  const callback = InteractAPI.Callback.create(dummyCallback, onError)
  // Setup the sequence of API calls
  checkSession()

  const calls = []
  // Setup API call sequence

  sessionCalls(calls)
  // Add postEvent to call sequence
  calls.push(InteractAPI.CommandUtil.createPostEventCmd(confObj.acceptEvent, getNameValuePairs(treatment)))

  // Execute Interact batch
  InteractAPI.executeBatch(confObj.ssId, calls, callback)
}

const postPresentEvent = params => {
  logMsg("In ContactEvent " + params)
  const trackingCode = "UACIOfferTrackingCode," + params + ",string"

  const callback = InteractAPI.Callback.create(dummyCallback, onError)
  InteractAPI.postEvent(ssId, "contact", getNameValuePairs(trackingCode), callback)
}

const getOffers = (spotId, aud, conf) => {
  // Set global config
  // debugger;
  updateConf(spotId, aud, conf)

  if (confObj.serverUrl == null) {
    logMsg(" Error: Interact server URL is not configured")
    return
  } else {
    InteractAPI.init({ url: confObj.serverUrl })
  }
  // Setup the sequence of API calls
  checkSession()

  const calls = []
  // Setup API call sequence

  sessionCalls(calls)
  // Add getOffers to call sequence
  calls.push(InteractAPI.CommandUtil.createGetOffersCmd(confObj[spotId].interactionPoint, confObj[spotId].maxNumOffers))
  // Add callback to render offers
  const callback = InteractAPI.Callback.create(response => {
    confObj[spotId].renderFunction(spotId, response)
  }, renderDefaultOffer)

  // Execute Interact batch
  InteractAPI.executeBatch(confObj.ssId, calls, callback)
}

const checkSession = () => {
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
      confObj.visitorAudID.split(",")[0],
    ]

    if (audKey === visitorKey && currKey !== visitorKey) {
      confObj.audId = restoredAudId
      confObj.audLvl = confObj.customerAudLvl
    } else {
      confObj.setAudience = true
      confObj.prevAudId = restoredAudId
      sessionStorage.setItem("audId", formattedAudId)
    }
  }

  const savedSess = sessionStorage.getItem("ssId")
  const savedTime = sessionStorage.getItem("ssTs")
  const currentTime = new Date().getTime()

  if (!savedSess || currentTime - savedTime > 1000 * 60 * confObj.timeout) {
    confObj.ssId = confObj.sessionCookie || `${formattedAudId}${currentTime}`
    sessionStorage.setItem("ssId", confObj.ssId)
    sessionStorage.setItem("ssTs", currentTime)
    confObj.startSession = true
  } else {
    confObj.ssId = savedSess
    sessionStorage.setItem("ssTs", currentTime)
  }
}

const sessionCalls = calls => {
  if (confObj.startSession) {
    const relyOldSs = true
    const audParts = confObj.audId.split(",")

    if (confObj.newVisitor) {
      const altID = `${confObj.visitorAltIDVar},${audParts[1]},${audParts[2]}`
      calls.push(
        InteractAPI.CommandUtil.createStartSessionCmd(
          confObj.icName,
          getNameValuePairs(confObj.visitorAudID),
          confObj.visitorAudLvl,
          getNameValuePairs(`${altID};${confObj.sessVars}`),
          relyOldSs,
          confObj.debug,
        ),
        InteractAPI.CommandUtil.createSetAudienceCmd(
          getNameValuePairs(confObj.audId),
          confObj.audLevel,
          getNameValuePairs(""),
        ),
      )
      if (confObj.idMgmt) {
        calls.push(InteractAPI.CommandUtil.createGetProfileCmd())
      }
    } else {
      calls.push(
        InteractAPI.CommandUtil.createStartSessionCmd(
          confObj.icName,
          getNameValuePairs(confObj.audId),
          confObj.audLevel,
          getNameValuePairs(confObj.sessVars),
          relyOldSs,
          confObj.debug,
        ),
      )
    }
  } else if (confObj.setAudience) {
    const params = confObj.prevAudIdVar
      ? `${confObj.prevAudIdVar},${confObj.prevAudId.replaceAll(",", "|")},string`
      : ""
    calls.push(
      InteractAPI.CommandUtil.createSetAudienceCmd(
        getNameValuePairs(confObj.audId),
        confObj.audLevel,
        getNameValuePairs(params),
      ),
    )
    if (confObj.idMgmt) {
      calls.push(InteractAPI.CommandUtil.createGetProfileCmd())
    }
  }
}

const audienceSwitch = response => {
  const respList = response.responses

  respList.forEach(response => {
    if (response.profile) {
      const profileList = response.profile
      logMsg("Reading profile")

      const profile = profileList.find(p => p.n === confObj.customerAud)
      if (profile && profile.v.toString().length > 1) {
        const audID = `${confObj.customerAud},${profile.v},${confObj.customerAudType}`
        const calls = [
          InteractAPI.CommandUtil.createSetAudienceCmd(
            confObj.customerAudLvl,
            getNameValuePairs(audID),
            getNameValuePairs(""),
          ),
        ]

        const callback = InteractAPI.Callback.create(dummyCallback, onErrorCallback)
        InteractAPI.executeBatch(confObj.ssId, calls, callback)
      }
    }
  })
}

const getOfferAttrValue = (offerAttrs, offerName) => {
  const foundOffer = offerAttrs.find(attr => attr.n.toLowerCase() === offerName.toLowerCase())
  return foundOffer ? foundOffer.v : ""
}

const logMsg = message => {
  if (confObj.debug) {
    console.log("[InteractClient] " + message)
  }
}
const getNameValuePairs = parameters => {
  if (parameters === "") return null

  return parameters.split(";").map(part => {
    const nvp1 = part.split(",")
    const nvp = [nvp1[0], null, nvp1[nvp1.length - 1]]

    // Combine the middle parts of nvp1 to form the value
    const value = nvp1.slice(1, -1).join(",")

    // Handle numeric type
    if (nvp[2] === InteractAPI.NameValuePair.prototype.TypeEnum.NUMERIC && !isNaN(value)) {
      nvp[1] = Number(value)
    } else {
      nvp[1] = value
    }

    // Special handling for NULL value
    if (nvp[1] && typeof nvp[1] === "string" && nvp[1].toUpperCase() === "NULL") {
      nvp[1] = null
    }

    return InteractAPI.NameValuePair.create(nvp[0], nvp[1], nvp[2])
  })
}

const dummyCallback = () => undefined

const onErrorCallback = response => {
  respList = response.responses

  if (response.batchStatusCode > 0) {
    logMsg("API call(s) failed")
    respList.forEach(resp => resp.messages.forEach(message => logMsg("   " + message.msg)))
    sessionStorage.setItem("ssTs", 0)
    return
  }
}

const updateConf = (spotId, aud, conf) => {
  if (aud) {
    Object.keys(aud).map(key => {
      confObj[key] = aud[key]
    })
  }
  if (conf) {
    confObj[spotId] = conf
  }
}

const setConfig = config => {
  confObj = config
}

const renderDefaultOffer = () => undefined

export {
  // applyOfferTemplate,
  audienceSwitch,
  checkSession,
  dummyCallback,
  getNameValuePairs,
  getOfferAttrValue,
  getOffers,
  // initModal,
  logMsg,
  onErrorCallback,
  postAccept,
  postEvent,
  postEventAndGetOffers,
  postPresentEvent,
  // renderDefaultOffer,
  // renderOffers,
  sessionCalls,
  setConfig,
  updateConf,
}
