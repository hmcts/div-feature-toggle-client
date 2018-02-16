const {sinon} = require('test/util/chai');
const featureToggles = require('../../src/featureToggles');

const stub = () => {
  sinon.stub(featureToggles, 'get');
  featureToggles.get.resolves({});
};

const restore = () => {
  featureToggles.get.restore();
};

function when(feature, test) {
  this.title = `${this.title} when ${feature} is enabled`;
  return (done) => {
    const cleanup = (err) => {
      featureToggles.unset(feature);
      done(err);
    };
    featureToggles.set(feature, true);
    test(cleanup);
  };
}

module.exports = { when, stub, restore,
  unset: featureToggles.unset,
  set: featureToggles.set
};
