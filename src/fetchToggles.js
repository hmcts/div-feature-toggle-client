const featureToggles = require('./featureToggles');

const lookup = ({feature, defaultState, origin }) => {
  return featureToggles.get(feature, defaultState, origin);
};

const fetchToggles = ({ features = [] } = {}) => {
  return (req, res, next) => {
    req.features = featureToggles.features;
    res.locals.features = featureToggles.features;

    const featureLookups = features.map(lookup);

    Promise.all(featureLookups).then(() => {return next();});
  };
};

module.exports = fetchToggles;
