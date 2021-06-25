import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import * as V from '../src/validators';

describe('json decoder for tuples', () => {
  it('should fail when given no validators', done => {
    const data = { tick: ['10/2/1991', 1000] };
    const decode = createDecoder({ tick: V.tuple() });
    expect(() => decode(data)).to.throw(
      'Expected tuples to have at least one validators\n' +
        'hint: you passed V.tuples with no validators\n' +
        'you should pass at least one validators e.g:\n' +
        '{\n' +
        '  field: V.tuples(V.string(), V.number()) // [string, number]\n' +
        '}',
    );
    done();
  });
  it('should fail when given non array for tuple', done => {
    const data = { tick: { from: '10/2/1991', ms: 1000 } };
    const decode = createDecoder({ tick: V.tuple(V.string(), V.number()) });
    expect(() => decode(data)).to.be.throw(
      `Expected array but got ${data.tick} at tick`,
    );
    done();
  });
  it('should pass when given two validators of same value type', done => {
    const data = { tick: ['10/2/1991', 1000] };
    const decode = createDecoder({ tick: V.tuple(V.string(), V.number()) });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should pass when given one validators of same value type', done => {
    const data = { tick: ['10/2/1991'] };
    const decode = createDecoder({ tick: V.tuple(V.string()) });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given schemas as validators of different value type', done => {
    const data = { tick: ['10/2/1991', 1000] };
    const decode = createDecoder({ tick: V.tuple(V.string(), V.boolean()) });
    expect(() => decode(data)).to.throw(
      `Expected boolean but got ${data.tick[1]} at tick[1]`,
    );
    done();
  });
  it('should pass when given schemas as validators of same value type', done => {
    const data = { tick: [{ from: '10/2/1991' }, { ms: 1000 }] };
    const decode = createDecoder({
      tick: V.tuple({ from: V.string() }, { ms: V.number() }),
    });
    expect(decode(data)).to.eq(data);
    done();
  });
  it('should pass when given schemas as validators of same array value type', done => {
    const data = {
      tick: [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 300] }],
    };
    const decode = createDecoder({
      tick: V.tuple({ from: V.array(V.string()) }, { ms: V.array(V.number()) }),
    });
    expect(decode(data)).to.eq(data);
    done();
  });
  it('should fail when given schemas as validators of different array value type', done => {
    const data = {
      tick: [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 'haha'] }],
    };
    const decode = createDecoder({
      tick: V.tuple({ from: V.array(V.string()) }, { ms: V.array(V.number()) }),
    });
    expect(() => decode(data)).to.throw(
      `Expected number but got ${data.tick[1]?.ms?.[1]} at tick[1].ms[1]`,
    );
    done();
  });
});
