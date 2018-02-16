const config = {
  'env': undefined,
  'featureToggleApiUrl': undefined
};

const set = conf => {
  Object.assign(config, conf);
};

const get = ( key ) => {return ( config[key] );};

module.exports = { set, get };