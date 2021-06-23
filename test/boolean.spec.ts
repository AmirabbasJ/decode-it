import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import * as V from '../src/validators';

describe('json decoder for booleans', () => {
  it('should pass when given same boolean fields', done => {
    const data = { isGay: true };
    const decode = createDecoder({ isGay: V.boolean() });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when given non boolean fields', done => {
    const data = { isMale: 'yes' };
    const decode = createDecoder({ isMale: V.boolean() });
    expect(() => decode(data)).to.throw(
      `Expected boolean but got ${data.isMale} at isMale`,
    );
    done();
  });
  it('should pass when given additional fields', done => {
    const data = {
      age: 27,
      code: 345435,
      isMale: false,
      lastName: 'gur',
    };
    const decode = createDecoder({
      isMale: V.boolean(),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when not including required fields', done => {
    const data = { isAdult: true };
    const decode = createDecoder({ isAdult: V.boolean(), isDrunk: V.boolean() });
    expect(() => decode(data)).to.throw(
      `Expected boolean but got undefined at isDrunk`,
    );
    done();
  });
  it('should pass when given same nested boolean fields', done => {
    const data = { x: { y: { z: { w: false } } } };
    const decode = createDecoder({
      x: { y: { z: { w: V.boolean() } } },
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given nested non boolean fields', done => {
    const data = { x: { y: { z: { w: {} } } } };
    const decode = createDecoder({
      x: { y: { z: { w: V.boolean() } } },
    });
    expect(() => decode(data)).to.throw(
      `Expected boolean but got ${data.x.y.z.w} at x.y.z.w`,
    );
    done();
  });
  it('should fail when given not including nested boolean fields', done => {
    const data = { x: { y: 'why??????' } };
    const decode = createDecoder({
      x: { y: { z: { w: V.boolean() } } },
    });
    expect(() => decode(data)).to.throw(
      `Expected object but got ${data.x.y} at x.y`,
    );
    done();
  });
});
