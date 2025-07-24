/* eslint-disable */
var InteractAPI = (function () {
	NameValuePair: {
	}
	BatchResponse: {
	}
	Response: {
	}
	AdvisoryMessage: {
	}
	Offer: {
	}
	OfferList: {
	}
	GetOfferRequest: {
	}
	Command: {
	}
	CommandUtil: {
	}
	Callback: {
	}
	ResponseTransUtil: {
	}
	function Q(R) {
		this.config = R;
	}
	function E(R) {
		if (R && R.enableLog && R.enableLog === 'true') {
			return true;
		} else {
			return false;
		}
	}
	function A(T, S) {
		if (T && typeof T.successCb === 'function') {
			const R = this.ResponseTransUtil.buildAPIResponse(S);
			T.successCb(R ? R : S);
		}
	}
	function K(S, R) {
		if (S && typeof S.failureCb === 'function') {
			S.failureCb(R);
		}
	}
	function O(V, W) {
		const U = this;
		const S = new XMLHttpRequest();
		const R = U.config.url + '/servlet/RestServlet';
		S.open('POST', R, true);
		S.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		if (V.indexOf('endSession') > -1) {
			U.config.endSession = true;
		}
		const T = L('m_tokenId');
		if (T) {
			S.setRequestHeader('m_tokenId', T);
		} else {
			if (U.config.m_user_name) {
				S.setRequestHeader('m_user_name', encodeURIComponent(U.config.m_user_name));
				S.setRequestHeader('m_user_password', encodeURIComponent(U.config.m_user_password));
			}
		}
		S.onreadystatechange = function () {
			if (S.readyState === 4) {
				P('m_tokenId', S.getResponseHeader('m_tokenId'), U.config.endSession);
				let Y = null;
				let Z = null;
				if (typeof S.response === 'string') {
					Z = S.response;
				} else {
					if (typeof S.responseText !== 'undefined') {
						Z = S.responseText;
					}
				}
				if (Z) {
					try {
						Y = JSON.parse(Z);
					} catch (X) {
						Y = Z;
					}
				}
				if (!Y) {
					Y = S.response;
				}
				if (S.status === 200) {
					if (E(U.config)) {
						console.log('Executing commands: ' + JSON.stringify(S.responseText));
					}
					A.call(U, W, Y);
				} else {
					if (E(U.config)) {
						console.error('Executing commands: ' + JSON.stringify(S.responseText));
					}
					K.call(U, W, Y);
				}
			}
		};
		S.send(V);
		if (E(U.config)) {
			console.log('Executing commands: ' + JSON.stringify(V));
		}
	}
	function F(S) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createGetVersionCmd();
		this.executeBatch(null, R, InteractAPI.FirstResponseCallback.create(S));
	}
	function N(S, T) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createEndSessionCmd();
		this.executeBatch(S, R, InteractAPI.FirstResponseCallback.create(T));
	}
	function I(S, R, T) {
		this.executeCmd(JSON.stringify({ sessionId: S, commands: R }), T);
	}
	function H(U, T, S, V) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createGetOffersCmd(T, S);
		this.executeBatch(U, R, InteractAPI.FirstResponseCallback.create(V));
	}
	function G(T, S, U) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createGetOffersForMultipleInteractionPointsCmd(S);
		this.executeBatch(T, R, InteractAPI.FirstResponseCallback.create(U));
	}
	function C(S, T) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createGetProfileCmd();
		this.executeBatch(S, R, InteractAPI.FirstResponseCallback.create(T));
	}
	function D(U, S, T, V) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createPostEventCmd(S, T);
		this.executeBatch(U, R, InteractAPI.FirstResponseCallback.create(V));
	}
	function J(T, S, U) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createSetDebugCmd(S);
		this.executeBatch(T, R, InteractAPI.FirstResponseCallback.create(U));
	}
	function M(V, U, S, T, W) {
		const R = new Array(1);
		R[0] = this.CommandUtil.createSetAudienceCmd(U, S, T);
		this.executeBatch(V, R, InteractAPI.FirstResponseCallback.create(W));
	}
	function B(W, U, V, S, Z, Y, R, X) {
		const T = new Array(1);
		T[0] = this.CommandUtil.createStartSessionCmd(U, V, S, Z, Y, R);
		this.executeBatch(W, T, InteractAPI.FirstResponseCallback.create(X));
	}
	function P(V, T, U) {
		if (T !== null && !U) {
			var S = new Date();
			S.setTime(S.getTime() + 15 * 60 * 1000);
			var R = 'expires=' + S.toUTCString();
			document.cookie = V + '=' + T + ';' + R + ';path=/interact/';
		} else {
			var S = new Date();
			S.setTime(S.getTime() - 24 * 60 * 60 * 1000);
			var R = 'expires=' + S.toUTCString();
			document.cookie = V + '=' + T + ';' + R + ';path=/interact/';
		}
	}
	function L(V) {
		const T = V + '=';
		const R = document.cookie.split(';');
		for (let U = 0; U < R.length; U++) {
			let S = R[U];
			while (S.charAt(0) == ' ') {
				S = S.substring(1);
			}
			if (S.indexOf(T) == 0) {
				return S.substring(T.length, S.length);
			}
		}
		return '';
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
	};
})();
InteractAPI.namespace = function (D) {
	let C = D.split('.');
	let B = InteractAPI;
	let A;
	if (C[0] === 'InteractAPI') {
		C = C.slice(1);
	}
	for (A = 0; A < C.length; A += 1) {
		if (B[C[A]] === 'undefined') {
			B[C[A]] = {};
		}
		B = B[C[A]];
	}
	return B;
};
InteractAPI.namespace('InteractAPI.NameValuePair');
InteractAPI.NameValuePair = function () {};
InteractAPI.NameValuePair.create = function (D, A, B) {
	const C = new InteractAPI.NameValuePair();
	C.n = D;
	C.v = A;
	C.t = B;
	return C;
};
InteractAPI.NameValuePair.prototype = {
	TypeEnum: { STRING: 'string', NUMERIC: 'numeric', DATETIME: 'datetime' },
	getName() {
		return this.n;
	},
	getValue() {
		return this.v;
	},
	getType() {
		return this.t;
	},
};
InteractAPI.namespace('InteractAPI.AdvisoryMessage');
InteractAPI.AdvisoryMessage = function () {};
InteractAPI.AdvisoryMessage.create = function (A, E, D, B) {
	const C = new InteractAPI.AdvisoryMessage();
	C.msgLevel = A;
	C.msg = E;
	C.detailMsg = D;
	C.msgCode = B;
	return C;
};
InteractAPI.AdvisoryMessage.prototype = {
	StatusLevelEnum: { INFO: 0, WARNING: 1, ERROR: 2 },
	getStatusLevel() {
		return this.msgLevel;
	},
	getMessage() {
		return this.msg;
	},
	getDetailedMessage() {
		return this.detailMsg;
	},
	getMessageCode() {
		return this.msgCode;
	},
};
InteractAPI.namespace('InteractAPI.Offer');
InteractAPI.Offer = function () {};
InteractAPI.Offer.create = function (G, C, A, F, E, B) {
	const D = new InteractAPI.Offer();
	D.n = G;
	D.code = C;
	D.treatmentCode = A;
	D.score = F;
	D.desc = E;
	D.attributes = B;
	return D;
};
InteractAPI.Offer.prototype = {
	getOfferName() {
		return this.n;
	},
	getOfferCode() {
		return this.code;
	},
	getTreatmentCode() {
		return this.treatmentCode;
	},
	getScore() {
		return this.score;
	},
	getDescription() {
		return this.desc;
	},
	getAttributes() {
		return this.attributes;
	},
};
InteractAPI.namespace('InteractAPI.OfferList');
InteractAPI.OfferList = function () {};
InteractAPI.OfferList.create = function (D, A, B) {
	const C = new InteractAPI.OfferList();
	C.ip = D;
	C.defaultString = A;
	C.offers = B;
	return C;
};
InteractAPI.OfferList.prototype = {
	getInteractionPointName() {
		return this.ip;
	},
	getDefaultString() {
		return this.defaultString;
	},
	getRecommendedOffers() {
		return this.offers;
	},
};
InteractAPI.namespace('InteractAPI.Response');
InteractAPI.Response = function () {};
InteractAPI.Response.create = function (G, D, B, C, A, E) {
	const F = new InteractAPI.Response();
	F.statusCode = D;
	F.sessionId = G;
	F.offerList = B;
	F.profile = C;
	F.version = A;
	F.messages = E;
	return F;
};
InteractAPI.Response.prototype = {
	StatusEnum: { SUCCESS: 0, WARNING: 1, ERROR: 2 },
	getAdvisoryMessages() {
		return this.messages;
	},
	getOfferList() {
		return this.offerList;
	},
	getProfileRecord() {
		return this.profile;
	},
	getSessionID() {
		return this.sessionId;
	},
	getStatusCode() {
		return this.statusCode;
	},
};
InteractAPI.namespace('InteractAPI.BatchResponse');
InteractAPI.BatchResponse = function () {};
InteractAPI.BatchResponse.create = function (A, B) {
	const C = new InteractAPI.Response();
	C.batchStatusCode = A;
	C.responses = B;
	return C;
};
InteractAPI.BatchResponse.prototype = {
	getBatchStatusCode() {
		return this.batchStatusCode;
	},
	getResponses() {
		return this.responses;
	},
};
InteractAPI.namespace('InteractAPI.OfferAttributeRequirements');
InteractAPI.OfferAttributeRequirements = function () {};
InteractAPI.OfferAttributeRequirements.create = function (A, B, C) {
	const D = new InteractAPI.OfferAttributeRequirements();
	D.numberRequested = A;
	if (B) {
		D.attributes = B;
	}
	if (C) {
		D.childOfferAttrReqs = C;
	}
	return D;
};
InteractAPI.OfferAttributeRequirements.prototype = {
	getNumberRequested() {
		return this.numberRequested;
	},
	getAttributes() {
		return this.attributes;
	},
	getChildRequirements() {
		return this.childOfferAttrReqs;
	},
};
InteractAPI.namespace('InteractAPI.GetOfferRequest');
InteractAPI.GetOfferRequest = function () {};
InteractAPI.GetOfferRequest.create = function (E, A, C, B) {
	const D = new InteractAPI.GetOfferRequest();
	D.ip = E;
	D.numberRequested = A;
	D.dupPolicy = C;
	D.offerAttribReq = B;
	if (!D.offerAttribReq) {
		D.offerAttribReq = InteractAPI.OfferAttributeRequirements.create(2147483647, [], null);
	}
	return D;
};
InteractAPI.GetOfferRequest.prototype = {
	DuplicationPolicyEnum: { NO_DUPLICATION: 1, ALLOW_DUPLICATION: 2 },
	getOfferAttributes() {
		return this.offerAttribReq;
	},
	getDuplicationPolicy() {
		return this.dupPolicy;
	},
	getIpName() {
		return this.ip;
	},
	getNumberRequested() {
		return this.numberRequested;
	},
};
InteractAPI.namespace('InteractAPI.Command');
InteractAPI.Command = function () {};
InteractAPI.Command.create = function (A) {
	const B = new InteractAPI.Command();
	if (A) {
		B.setMethodIdentifier(A);
	}
	return B;
};
InteractAPI.Command.prototype = {
	CommandEnum: {
		ENDSESSION: 'endSession',
		GETOFFERS: 'getOffers',
		GETOFFERS_MULTI_IP: 'getOffersForMultipleInteractionPoints',
		GETPROFILE: 'getProfile',
		GETVERSION: 'getVersion',
		POSTEVENT: 'postEvent',
		SETAUDIENCE: 'setAudience',
		SETDEBUG: 'setDebug',
		STARTSESSION: 'startSession',
	},
	setMethodIdentifier(A) {
		this.action = A;
	},
	getMethodIdentifier() {
		return this.action;
	},
	setAudienceID(A) {
		this.audienceID = A;
	},
	getAudienceID() {
		return this.audienceID;
	},
	setAudienceLevel(A) {
		this.audienceLevel = A;
	},
	getAudienceLevel() {
		return this.audienceLevel;
	},
	setDebug(A) {
		this.debug = A;
	},
	getDebug() {
		return this.debug;
	},
	setRelyOnExistingSession(A) {
		this.relyOnExistingSession = A;
	},
	getRelyOnExistingSession() {
		return this.relyOnExistingSession;
	},
	setNumberRequested(A) {
		this.numberRequested = A;
	},
	getNumberRequested() {
		return this.numberRequested;
	},
	setInteractionPoint(A) {
		this.ip = A;
	},
	getInteractionPoint() {
		return this.ip;
	},
	setInteractiveChannel(A) {
		this.ic = A;
	},
	getInteractiveChannel() {
		return this.ic;
	},
	setEvent(A) {
		this.event = A;
	},
	getEvent() {
		return this.event;
	},
	setParameters(A) {
		this.parameters = A;
	},
	getParameters() {
		return this.parameters;
	},
	setGetOfferRequests(A) {
		this.getOfferRequests = A;
	},
	getGetOfferRequests() {
		return this.getOfferRequests;
	},
};
InteractAPI.namespace('InteractAPI.CommandUtil');
InteractAPI.CommandUtil = function () {};
InteractAPI.CommandUtil.createGetVersionCmd = function () {
	return InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.GETVERSION);
};
InteractAPI.CommandUtil.createEndSessionCmd = function () {
	return InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.ENDSESSION);
};
InteractAPI.CommandUtil.createStartSessionCmd = function (B, G, A, E, F, C) {
	const D = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.STARTSESSION);
	D.setInteractiveChannel(B);
	D.setAudienceID(G);
	D.setAudienceLevel(A);
	D.setRelyOnExistingSession(F);
	D.setDebug(C);
	if (E) {
		D.setParameters(E);
	}
	return D;
};
InteractAPI.CommandUtil.createGetOffersCmd = function (C, A) {
	const B = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.GETOFFERS);
	B.setInteractionPoint(C);
	B.setNumberRequested(A);
	return B;
};
InteractAPI.CommandUtil.createGetOffersForMultipleInteractionPointsCmd = function (A) {
	const B = InteractAPI.Command.create(
		InteractAPI.Command.prototype.CommandEnum.GETOFFERS_MULTI_IP
	);
	B.setGetOfferRequests(A);
	return B;
};
InteractAPI.CommandUtil.createGetProfileCmd = function () {
	return InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.GETPROFILE);
};
InteractAPI.CommandUtil.createPostEventCmd = function (B, C) {
	const A = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.POSTEVENT);
	A.setEvent(B);
	if (C) {
		A.setParameters(C);
	}
	return A;
};
InteractAPI.CommandUtil.createSetDebugCmd = function (B) {
	const A = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.SETDEBUG);
	A.setDebug(B);
	return A;
};
InteractAPI.CommandUtil.createSetAudienceCmd = function (D, A, C) {
	const B = InteractAPI.Command.create(InteractAPI.Command.prototype.CommandEnum.SETAUDIENCE);
	B.setAudienceID(D);
	B.setAudienceLevel(A);
	if (C) {
		B.setParameters(C);
	}
	return B;
};
InteractAPI.namespace('InteractAPI.Callback');
InteractAPI.Callback = function () {};
InteractAPI.Callback.create = function (A, C) {
	const B = new InteractAPI.Callback();
	if (A) {
		B.successCb = A;
	}
	if (C) {
		B.failureCb = C;
	}
	return B;
};
InteractAPI.namespace('InteractAPI.FirstResponseCallback');
InteractAPI.FirstResponseCallback = function () {};
InteractAPI.FirstResponseCallback.create = function (B) {
	if (!B) {
		return null;
	}
	const A = InteractAPI.Callback.create(
		InteractAPI.FirstResponseCallback.prototype.sucCb,
		InteractAPI.FirstResponseCallback.prototype.failCb
	);
	A.callback = B;
	return A;
};
InteractAPI.FirstResponseCallback.prototype = {
	sucCb(A) {
		if (A && this.callback && typeof this.callback.successCb === 'function') {
			this.callback.successCb(InteractAPI.FirstResponseCallback.prototype.extract(A));
		}
	},
	failCb(A) {
		if (this.callback && typeof this.callback.failureCb === 'function') {
			this.callback.failureCb(A);
		}
	},
	extract(A) {
		if (A.responses !== 'undefined' && A.responses.length >= 1) {
			return A.responses[0];
		} else {
			return null;
		}
	},
};
InteractAPI.namespace('InteractAPI.ResponseTransUtil');
InteractAPI.ResponseTransUtil = function () {};
InteractAPI.ResponseTransUtil._buildAdvisoryMessage = function (A) {
	if (!A) {
		return null;
	}
	return InteractAPI.AdvisoryMessage.create(A.msgLevel, A.msg, A.detailMsg, A.msgCode);
};
InteractAPI.ResponseTransUtil._buildOffer = function (C) {
	if (!C) {
		return null;
	}
	let B = null;
	if (C.attributes) {
		B = [];
		for (let D = 0; D < C.attributes.length; D++) {
			const A = this._buildNameValuePair(C.attributes[D]);
			if (A) {
				B.push(A);
			}
		}
	}
	return InteractAPI.Offer.create(C.n, C.code, C.treatmentCode, C.score, C.desc, B);
};
InteractAPI.ResponseTransUtil._buildOfferList = function (D) {
	if (!D) {
		return null;
	}
	let C = null;
	if (D.offers) {
		C = [];
		for (let B = 0; B < D.offers.length; B++) {
			const A = this._buildOffer(D.offers[B]);
			if (A) {
				C.push(A);
			}
		}
	}
	return InteractAPI.OfferList.create(D.ip, D.defaultString, C);
};
InteractAPI.ResponseTransUtil._buildNameValuePair = function (A) {
	if (!A) {
		return null;
	} else {
		return InteractAPI.NameValuePair.create(A.n, A.v, A.t);
	}
};
InteractAPI.ResponseTransUtil._buildResponse = function (C) {
	if (!C) {
		return null;
	}
	let J = null;
	if (C.offerLists) {
		J = [];
		for (let F = 0; F < C.offerLists.length; F++) {
			const E = this._buildOfferList(C.offerLists[F]);
			if (E) {
				J.push(E);
			}
		}
	}
	let D = null;
	if (C.messages) {
		D = [];
		for (let G = 0; G < C.messages.length; G++) {
			const A = this._buildAdvisoryMessage(C.messages[G]);
			if (A) {
				D.push(A);
			}
		}
	}
	let B = null;
	if (C.profile) {
		B = [];
		for (let H = 0; H < C.profile.length; H++) {
			const I = this._buildNameValuePair(C.profile[H]);
			if (I) {
				B.push(I);
			}
		}
	}
	return InteractAPI.Response.create(C.sessionId, C.statusCode, J, B, C.version, D);
};
InteractAPI.ResponseTransUtil._buildBatchResponse = function (B) {
	if (!B) {
		return null;
	}
	let C = null;
	if (B.responses) {
		C = [];
		for (let A = 0; A < B.responses.length; A++) {
			const D = this._buildResponse(B.responses[A]);
			if (D) {
				C.push(D);
			}
		}
	}
	return InteractAPI.BatchResponse.create(B.batchStatusCode, C);
};
InteractAPI.ResponseTransUtil.buildAPIResponse = function (A) {
	if (!A) {
		return null;
	}
	if (A.batchStatusCode !== 'undefined') {
		return this._buildBatchResponse(A);
	} else {
		return this._buildResponse(A);
	}
};

export default InteractAPI;
