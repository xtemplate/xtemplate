const XTemplate = require('../../../');
const expect = require('expect.js');

describe('support when data is null', () => {
  describe('when non-strict mod', () => {
    it('should render empty when property of data is null', () => {
      const tpl = '{{x.y}}';
      const render = new XTemplate(tpl).render({
        x: null,
      });

      expect(render).to.equal('');
    });

    it('should render empty when sub property of data is null', () => {
      const tpl = '{{x.y.z}}';
      const render = new XTemplate(tpl).render({
        x: { y: null },
      });

      expect(render).to.equal('');
    });

    it('should render empty when property of affix is null', () => {
      const tpl = '{{set(x=null)}}{{x.y}}';
      const render = new XTemplate(tpl).render({});

      expect(render).to.equal('');
    });

    it('should render empty when sub property of affix is null', () => {
      const tpl = '{{set(x={y:null})}}{{x.y.z}}';
      const render = new XTemplate(tpl).render({});

      expect(render).to.equal('');
    });
  });

  describe('when strict mod', () => {
    it('should render throw when property of data is null', () => {
      expect(() => {
        const tpl = '{{x.y}}';
        new XTemplate(tpl, { strict: true }).render({
          x: null,
        });
      }).to.throwError();
    });

    it('should render throw when sub property of data is null', () => {
      expect(() => {
        const tpl = '{{x.y.z}}';
        new XTemplate(tpl, { strict: true }).render({
          x: { y: null },
        });
      }).to.throwError();
    });

    it('should render throw when property of affix is null', () => {
      expect(() => {
        const tpl = '{{set(x=null)}}{{x.y}}';
        new XTemplate(tpl, { strict: true }).render();
      }).to.throwError();
    });

    it('should render throw when sub property of affix is null', () => {
      expect(() => {
        const tpl = '{{set(x={y:null})}}{{x.y.z}}';
        new XTemplate(tpl, { strict: true }).render();
      }).to.throwError();
    });
  });
});
