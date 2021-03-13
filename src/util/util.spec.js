const uuid = require('./uuid');


describe('util tests', () => {

  describe('generate', () => {
    it('should generate uuid', () => {
        const val = uuid.generate();
        expect(val).not.toBeNull();
    });
  });
});
