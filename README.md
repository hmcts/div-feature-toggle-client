# Feature toggle client

## Installation

As of now, this module is published only in a private repository.
We are working on publishing this project to NPM.
Until then, the package can be installed from its github URL, examples:

```bash
# Install the latest version
yarn add https://github.com/hmcts/div-feature-toggle-client

# Install a specific version
yarn add https://github.com/hmcts/div-feature-toggle-client#1.0.7

## Prerequisites

As of now, this module is published only in a private repository.
We are working on publishing this project to NPM.

* Node >=8.0
* yarn

## Usage

### Setup

The first require of the feature toggle requires the following settings:
```
{
  'env': process.env.NODE_ENV,
  'featureToggleApiUrl': "http://feature-toggle-api-url.com"
}
```

E.g.
```
require('feature-toggle')({
    env: process.env.NODE_ENV,
    featureToggleApiUrl: process.env.FEATURE_TOGGLE_API_URL
});
```

### Get features

To get features on each request add the fetchToggles middleware to your express middlwares e.g.

```
const { fetchToggles } = require('feature-toggle')();
app.use(fetchToggles({
  features: [
    feature('feature1'),
    feature('feature2')
  ]
}));
```

### Get feature enabled/disabled

To find out if a feature is enabled / disabled:

```
const {features} = require('feature-toggle')().featureToggles;
if(features.feature1){
  // feature1 is active
}else{
  // feature1 is not active
}
```

### E2E Codecept Tests

#### Create a helper

To test environements using codecept we suggest you create a codeceptjs helper `/test/end-to-end/helpers/featureToggleHelper` e.g.

```
'use strict';

let Helper = codecept_helper;
const {get, features} = require('feature-toggle')().featureToggles;

class FeatureToggleHelper extends Helper {

  getFeatureEnabled(feature, defaultValue) {

    return get(feature, defaultValue)
    .then(() => {
      return features[feature];
    });

  }

}

module.exports = FeatureToggleHelper;

```

#### Add to codecept conf file

Add following setting to `codecept.conf.js`:

```
exports.config = {
  'helpers': {
    'FeatureToggleHelper': {
      'require': './helpers/featureToggleHelper.js'
    }
  }
};
```

#### Use in tests

In your codecept test simply yield the feature

```
const feature1 = yield I.getFeatureEnabled('feature1', true);
if(feature1){
  // run feature enabled e2e tests
}

```

### Unit Tests

To run unit tests we suggest you create a mock featureToggles function. Below is an example of a mocked featureToggles function:

```
const {sinon} = require('test/util/chai');
const featureToggles = require('@divorce/feature-toggles')().featureToggles;

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

```

And here is an example of usage:

```
const featureToggles = require('./featureToggles');

describe('Test feature2', () => {

  beforeEach(() => {
    featureToggles.stub();
    featureToggles.set('feature1', false);
    featureToggles.set('feature2', true);
  });

  afterEach(() => {
    featureToggles.restore();
    featureToggles.unset('feature1');
    featureToggles.unset('feature2');
    s.http.close();
  });

  it

})
```

