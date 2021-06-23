import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import * as V from '../src/validators';

describe('json decoder for strings', () => {
  it('should pass when given same string fields', done => {
    const data = { name: 'nick', country: 'iran' };
    const decode = createDecoder({ name: V.string(), country: V.string() });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when given non string fields', done => {
    const data = { name: 'nick', country: 14634 };
    const decode = createDecoder({ name: V.string(), country: V.string() });
    expect(() => decode(data)).to.throw(
      `Expected string but got ${data.country} at country`,
    );
    done();
  });
  it('should pass when given additional fields', done => {
    const data = {
      name: 'nick',
      country: 'turkey',
      id: 2524679,
      lastName: 'gur',
    };
    const decode = createDecoder({ name: V.string(), country: V.string() });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should throw when not including required fields', done => {
    const data = { name: 'nick' };
    const decode = createDecoder({ name: V.string(), country: V.string() });
    expect(() => decode(data)).to.throw(
      `Expected string but got undefined at country`,
    );
    done();
  });
});
