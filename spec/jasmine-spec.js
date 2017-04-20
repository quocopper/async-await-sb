request = require( 'request' );

const test_url = 'https://www.google.ca';
const assets_url = 'http://localhost:3000/asset-types';
var container_id = '';

describe("Asynchronous specs Tutorial", function() {
  var value;

  beforeEach(function(done) {
    setTimeout(function() {
      value = 0;
      done();
    }, 1);
  });

  it("should support async execution of test preparation and expectations", function(done) {
    value++;
    expect(value).toBeGreaterThan(0);
    done();
  });

  describe("long asynchronous specs", function() {
    var originalTimeout;
    beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
    });

    it("takes a long time", function(done) {
      setTimeout(function() {
        done();
      }, 900);
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
  });


});