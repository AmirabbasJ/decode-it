import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import { formatToJson } from '../src/errorFormatter';
import * as V from '../src/validators';

describe('json decoder for numbers', () => {
  it('should pass when given same number fields', done => {
    const data = { age: 23 };
    const decode = createDecoder({ age: V.number() });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when given non number fields', done => {
    const data = { age: '1236' };
    const decode = createDecoder({ age: V.number() });
    expect(() => decode(data as any)).to.throw(
      `Expected number but got ${formatToJson(data.age)} at age`,
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
      age: V.number(),
      code: V.number(),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when not including required fields', done => {
    const data = { age: 41 };
    const decode = createDecoder({ age: V.number(), height: V.number() });
    expect(() => decode(data as any)).to.throw(
      `Expected number but got undefined at height`,
    );
    done();
  });
  it('should pass when given same nested number fields', done => {
    const data = { x: { y: { z: { w: 200 } } } };
    const decode = createDecoder({
      x: { y: { z: { w: V.number() } } },
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given nested non number fields', done => {
    const data = { x: { y: { z: { w: false } } } };
    const decode = createDecoder({
      x: { y: { z: { w: V.number() } } },
    });
    expect(() => decode(data as any)).to.throw(
      `Expected number but got ${formatToJson(data.x.y.z.w)} at x.y.z.w`,
    );
    done();
  });
  it('should fail when given not including nested number fields', done => {
    const data = { x: { y: 'why??????' } };
    const decode = createDecoder({
      x: { y: { z: { w: V.number() } } },
    });
    expect(() => decode(data as any)).to.throw(
      `Expected object but got ${formatToJson(data.x.y)} at x.y`,
    );
    done();
  });
});
