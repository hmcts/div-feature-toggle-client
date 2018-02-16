const fetchToggles = require('./src/fetchToggles');
const featureToggles = require('./src/featureToggles');
const {set} = require('./src/settings');

module.exports = (config) => {

  if(config){
    set(config);
  }

  return { fetchToggles, featureToggles };

 };
