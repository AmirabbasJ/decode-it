import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import * as V from '../src/validators';

describe('json decoder for literals', () => {
  it('should pass when given literal with no parameter and undefined', done => {
    const data = {};
    const decode = createDecoder({
      email: V.literal(undefined),
    });
    expect(() => decode(data)).to.be.eq(data);
  });
  it('should pass when given literal with same value as parameter', done => {
    const data = { email: 'shit@wow.com' };
    const decode = createDecoder({
      email: V.literal('shit@wow.com'),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given literal with different value as parameter', done => {
    const data = { email: 'shit@wow.com' };
    const decode = createDecoder({
      email: V.literal('notshit@wow.com'),
    });
    expect(() => decode(data)).to.throw(
      `Expected literal "notshit@wow.com" but got ${data.email} at email`,
    );
    done();
  });
  it('should pass when given literal array with same value as parameter', done => {
    const data = { email: ['shit@wow.com'] };
    const decode = createDecoder({
      email: V.literal(['shit@wow.com']),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should pass when given literal array of objects with same value as parameter', done => {
    const data = { items: [{ x: { y: { a: [1, 2, 3] } } }] };
    const decode = createDecoder({
      items: V.literal([{ x: { y: { a: [1, 2, 3] } } }]),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given literal array of objects with different value as parameter', done => {
    const data = { items: [{ x: { y: { a: [1, 2, 3] } } }] };
    const decode = createDecoder({
      items: V.literal([{ x: { y: { a: [1, 2, 3, 4] } } }]),
    });
    expect(() => decode(data)).to.throw(
      `Expected literal [{"x":{"y":{"a":[1,2,3,4]}}}] but got [{"x":{"y":{"a":[1,2,3]}}}] at items`,
    );
    done();
  });
});
