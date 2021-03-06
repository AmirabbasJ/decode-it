import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import { formatToJson } from '../src/errorFormatter';
import * as V from '../src/validators';

describe('json decoder for literals', () => {
  it('should pass when given literal with no parameter and undefined', done => {
    const data = {};
    const decode = createDecoder({
      email: V.literal(undefined),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should pass when given literal with same value as parameter', done => {
    const data = { email: 'shit@wow.com' };
    const decode = createDecoder({
      email: V.literal('shit@wow.com'),
    });
    expect(decode(data as any)).to.be.eq(data);
    done();
  });
  it('should fail when given literal with different value as parameter', done => {
    const data = { email: 'shit@wow.com' };
    const decode = createDecoder({
      email: V.literal('notshit@wow.com'),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected "notshit@wow.com" but got ${formatToJson(data.email)} at email`,
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
      `Expected ${formatToJson([
        { x: { y: { a: [1, 2, 3, 4] } } },
      ])} but got ${formatToJson(data.items)} at items`,
    );
    done();
  });

  it('should fail when given nested literal with same value as parameter', done => {
    const data = { email: 'shit@wow.com' };
    const decode = createDecoder({
      email: V.literal(V.literal(V.literal('shit@wow.com'))),
    });
    expect(() => decode(data as any)).to.be.throw(
      `Expected non function literal but got one at email\n` +
        `hint: you probably passed a validator (or just a function) to a literal validator\n` +
        `and since a json doesn't have function in their field this is not possible`,
    );
    done();
  });
});
