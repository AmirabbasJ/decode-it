import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import * as V from '../src/validators';

describe('json decoder for nulls', () => {
  it('should pass when given same null fields', done => {
    const data = { billionDollarMistake: null };
    const decode = createDecoder({ billionDollarMistake: V.nil() });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when given non null fields', done => {
    const data = { colors: ['red', 'blue', 'green'] };
    const decode = createDecoder({ colors: V.nil() });
    expect(() => decode(data)).to.throw(
      `Expected null but got ${data.colors} at colors`,
    );
    done();
  });
  it('should pass when given additional fields', done => {
    const data = {
      age: 27,
      code: 345435,
      isMale: false,
      lastName: null,
    };
    const decode = createDecoder({
      lastName: V.nil(),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when not including required fields', done => {
    const data = { talent: null };
    const decode = createDecoder({ talent: V.nil(), name: V.nil() });
    expect(() => decode(data)).to.throw(`Expected null but got undefined at name`);
    done();
  });
  it('should pass when given same nested null fields', done => {
    const data = { x: { y: { z: { w: null } } } };
    const decode = createDecoder({
      x: { y: { z: { w: V.nil() } } },
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given nested non null fields', done => {
    const data = { x: { y: { z: { w: { f: null } } } } };
    const decode = createDecoder({
      x: { y: { z: { w: V.nil() } } },
    });
    expect(() => decode(data)).to.throw(
      `Expected null but got ${data.x.y.z.w} at x.y.z.w`,
    );
    done();
  });
  it('should fail when given not including nested null fields', done => {
    const data = { x: { y: 'why??????' } };
    const decode = createDecoder({
      x: { y: { z: { w: V.nil() } } },
    });
    expect(() => decode(data)).to.throw(
      `Expected object but got ${data.x.y} at x.y`,
    );
    done();
  });
  it('should fail when given undefined instead of null fields', done => {
    const data = { thisIsNotNull: undefined };
    const decode = createDecoder({
      thisIsNotNull: V.nil(),
    });
    expect(() => decode(data)).to.throw(
      `Expected null but got ${data.thisIsNotNull} at thisIsNotNull`,
    );
    done();
  });
});
