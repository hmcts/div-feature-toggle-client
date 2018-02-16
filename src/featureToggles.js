const request = require('request-promise-native');
const parseBool = (bool = '') => {return ( typeof bool === 'string' ? bool.toLowerCase() === 'true' : bool === true );};
const {get: getSetting} = require('./settings');

const featureStore = {};

const featureStoreProxy = new Proxy(featureStore, {
  get(target, key) {
    const exists = () => {return key in target;};
    const enabled = () => {return 'enabled' in target[key];};
    return exists() && (enabled() ? target[key].enabled : target[key].defaultState);
  },
  set() {
    throw Error('Setting features is not allowed. Use featureToggles#set');
  }
});

const set = (feature, enabled, origin) => {
  featureStore[feature] = featureStore[feature] || { feature };
  featureStore[feature].enabled = parseBool(enabled);

  featureStore[feature].origin = origin || 'other';

  return featureStore[feature];
};

const unset = (feature) => {
  if (feature in featureStore) {
    return delete featureStore[feature];
  } else {
    return false;
  }
};

const flagUrl = (flag, options) => {
  return `${getSetting('featureToggleApiUrl')}/${flag}/${options.node_env}`;
};

const get = (feature, defaultState = false, origin = 'other', opts = {node_env: getSetting('env')}) => {
  featureStore[feature] = { feature, defaultState, origin };
  const options = Object.assign({ proxy: null }, opts);
  return request
    .get(flagUrl(feature.toLowerCase(), options))
    .then(body => {return set(feature, body, 'feature-toggle-api');})
    .catch(() => {return Promise.resolve(featureStore[feature]);} );
};

const getFeatureToggles = () => {
    return featureStore;
};

module.exports = { 
  get,
  set,
  unset,
  features: featureStoreProxy,
  getFeatureToggles 
};
