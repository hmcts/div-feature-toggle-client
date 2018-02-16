const {expect, sinon} = require('../test/util');
const request = require('request-promise-native');
const featureToggles = require('./featureToggles');
const fetchToggles = require('./fetchToggles');

const fetch = (features) => {
  let resolve, reject;
  const p = new Promise((res, rej) => { resolve = res; reject = rej; });
  const req = {};
  const res = { locals: {} };
  const next = () => {
    try {
      resolve({req, res});
    } catch (e) {
      reject(e);
    }
  };
  fetchToggles({
    features: features.map(name => { return { feature: name }; })
  })(req, res, next);
  return p;
};

describe('featureToggles', () => {
  beforeEach(() => {
    sinon.stub(request, 'get');
    sinon.spy(featureToggles, 'get');

    request.get
      .withArgs(sinon.match(/.*foo.*/))
      .resolves( true );
    request.get
      .withArgs(sinon.match(/bar/))
      .resolves( false );
    request.get
      .withArgs(sinon.match(/badparsedresponse/))
      .resolves( 'invalid' );
  });

  afterEach(() => {
    request.get.restore();
    featureToggles.get.restore();
  });


  describe('#fetchToggles', () => {
    it('returns a middleware function', () => {
      const foo = fetchToggles();
      expect(foo).to.be.a('function');
    });

    it('handles being given no features', () => {
      return expect(fetch([])).be.fulfilled;
    });

    it('fetches features state from featureToggles service', () => {
      return fetch(['foo']).then(() => {
        expect(featureToggles.get).calledOnce;
        expect(featureToggles.get).calledWith('foo');
      });
    });

    it('fetches multiple features', () => {
      return fetch(['foo', 'bar']).then(() => {
        expect(featureToggles.get).calledTwice;
        expect(featureToggles.get).calledWith('foo');
        expect(featureToggles.get).calledWith('bar');
      });
    });

    it('attaches the features to req', () => {
      return fetch(['foo']).then(({req}) => {
        expect(req).to.have.key('features');
        expect(req.features.foo).to.be.true;
      });
    });

    it('gracefully recovers from response misparsing', () => {
      return fetch(['badParsedResponse']).then(({req}) => {
        expect(req.features.badParsedResponse).to.be.false;
      });
    });

    it('prevents setting req.features', () => {
      return fetch(['foo']).then(({req}) => {
        expect(() => req.features.foo = false).to.throw; // eslint-disable-line 
      });
    });

    it('attaches the features to res.locals', () => {
      return fetch(['foo']).then(({res}) => {
        expect(res.locals).to.have.key('features');
        expect(res.locals.features).to.contain.key('foo');
        expect(res.locals.features.foo).to.be.true;
      });
    });

    it('prevents setting res.locals.features', () => {
      return fetch(['foo']).then(({res}) => {
        expect(() => res.locals.features.foo = false).to.throw; // eslint-disable-line 
      });
    });

  });

});
