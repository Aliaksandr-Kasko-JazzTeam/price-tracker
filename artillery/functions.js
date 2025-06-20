const crypto = require('crypto');
const products = require('../libs/shared/scripts/products.json');

function handleErrors(res) {
  if (res.statusCode >= 400) {
    console.error(`❌ HTTP ${res.statusCode}:`, res.body || 'No response body');
    throw new Error(`Status ${res.statusCode}: stopping scenario`);
  }
}

function storeToken(res, userContext) {
  const parsed = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
  userContext.vars.token = parsed.token;
}

function extractProductId(res, userContext) {
  try {
    const products = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
    if (products && products.length) {
      userContext.vars.productId = products[0].id;
    } else {
      console.warn('No subscriptions');
      userContext.vars.productId = null;
    }
  } catch (e) {
    console.error('Error on respponse parsing:', e);
    userContext.vars.productId = null;
  }
}

module.exports = {
  generateUserData: (userContext, events, done) => {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const uniqueId = `${timestamp}-${randomSuffix}`;

    userContext.vars.name = `user-${uniqueId}`;
    userContext.vars.email = `user-${uniqueId}@test.com`;
    userContext.vars.password = `pass-${uniqueId}-word`;
    return done();
  },

  chooseProduct: (userContext, events, done) => {
    const randomIndex = Math.floor(Math.random() * products.length);
    userContext.vars.productUrl = products[randomIndex];
    return done();
  },

  afterRegister: (req, res, userContext, events, done) => {
    try {
      handleErrors(res);
      storeToken(res, userContext);
    } catch (e) {
      events.emit('error', e);
    }
    return done();
  },

  afterGetSubscriptions: (req, res, userContext, events, done) => {
    try {
      handleErrors(res);
      extractProductId(res, userContext);
    } catch (e) {
      events.emit('error', e);
    }
    return done();
  },

  handleErrorsOnly: (req, res, userContext, events, done) => {
    try {
      handleErrors(res);
    } catch (e) {
      events.emit('error', e);
    }
    return done();
  }
}


