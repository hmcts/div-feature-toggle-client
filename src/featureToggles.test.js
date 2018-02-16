const {expect, sinon} = require('../test/util');
const request = require('request-promise-native');
const { get, set, unset, features } = require('./featureToggles');

describe('app/services/featureToggles', () => {

  beforeEach(() => {
    sinon.stub(request, 'get');
  });

  afterEach(() => {
    request.get.restore();
  });

  describe('#get', () => {

    it('resolves the flags status', () => {
      request.get.resolves( true );
      const _true = { feature: 'foo', enabled: true, defaultState: false, origin: 'feature-toggle-api' };

      return expect(get('foo')).to.eventually.eql(_true);
    });

    it('calls the Feature Toggle API', () => {
      request.get.resolves( true );
      return get('foo').then(() => {
        expect(request.get).to.have.been.calledOnce;
        expect(request.get).to.have.been.calledWithMatch(/foo/);
      });
    });

    it('resolves the default value if request failed', () => {
      request.get.rejects('Request failed');
      const _true = { feature: 'foo', defaultState: true, origin: 'other' };

      return expect(get('foo', true)).to.eventually.eql(_true);
    });

    it('resolves to false if request failed and no default given', () => {
      request.get.rejects('Request failed');
      const _false = { feature: 'foo', defaultState: false, origin: 'other' };

      return expect(get('foo')).to.eventually.eql(_false);
    });
  });

  describe('#set', () => {

    it('sets the value of a feature to true', () => {
      const feature = { feature: 'setsValue', enabled: true, origin: 'other' };
      expect(set('setsValue', true)).to.eql(feature);
    });

    it('sets the value of a feature to false', () => {
        const feature = { feature: 'setsValue', enabled: false, origin: 'other' };
        expect(set('setsValue', false)).to.eql(feature);
    });

    it('sets the value of a feature to true if boolean is string', () => {
      const feature = { feature: 'setsValue', enabled: true, origin: 'other' };
      expect(set('setsValue', 'true')).to.eql(feature);
    });

    it('sets the value of a feature to false if boolean is string', () => {
      const feature = { feature: 'setsValue', enabled: false, origin: 'other' };
      expect(set('setsValue', 'false')).to.eql(feature);
    });

    it('sets the value of a feature to true if boolean is capitalized string', () => {
      const feature = { feature: 'setsValue', enabled: true, origin: 'other' };
      expect(set('setsValue', 'True')).to.eql(feature);
    });

    it('sets the value of a feature to false if boolean is capitalized string', () => {
      const feature = { feature: 'setsValue', enabled: false, origin: 'other' };
      expect(set('setsValue', 'False')).to.eql(feature);
    });

    it('sets the value of a feature to false if undefined', () => {
        const feature = { feature: 'setsValue', enabled: false, origin: 'other' };
        expect(set('setsValue', undefined)).to.eql(feature);
    });

    it('sets the value of a feature to true and the origin to the passed in one', () => {
      const feature = { feature: 'setsValue', enabled: true, origin: 'some-other-api' };
      expect(set('setsValue', true, 'some-other-api')).to.eql(feature);
    });

  });

  describe('#unset', () => {

    beforeEach(() => {
      set('setKey', true);
      expect(features.setKey).to.be.true;
    });

    it('returns true if key existed and was deleted', () => {
      expect(unset('setKey')).to.be.true;
    });

    it('returns false if key didnt exist', () => {
      expect(unset('notYetSet')).to.be.false;
    });

    it('deletes the key from featureStore', () => {
      unset('setKey');
      expect(features).to.not.contain.key('setKey');
    });

  });

  describe('#features', () => {

    it('prevents clients from setting features', () => {
      const settingFeature = () => {return features.shouldNotExist = true;};
      expect(settingFeature).to.throw('Setting features is not allowed');
      expect(() => {return features.shouldNotExist;}).to.throw;
    });

    it('provides access to features current states', () => {
      request.get.resolves( true );

      return get('foo').then(() => {
        expect(features.foo).to.be.true;
      });
    });

    it('provides the default if a lookup fails', () => {
      request.get.rejects('Intentional failure');

      return get('shouldDefault', true).then(() => {
        expect(features.shouldDefault).to.be.true;
      });
    });

    it('returns false if a feature is not fetched', () => {
      expect(features.unfetchedFeature).to.be.false;
    });
  });
});
