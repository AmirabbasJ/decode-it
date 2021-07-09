import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import { formatToJson } from '../src/errorFormatter';
import { toNativeType } from '../src/toNativeType';
import * as V from '../src/validators';

describe('json decoder for tuples', () => {
  it('should fail when given no validators', done => {
    const data = { tick: ['10/2/1991', 1000] };
    const decode = createDecoder({ tick: V.tuple() });
    expect(() => decode(data as any)).to.throw(
      'Expected tuples to have at least one validators\n' +
        'hint: you passed V.tuples with no validators\n' +
        'you should pass at least one validators e.g:\n' +
        '{\n' +
        '  field: V.tuples(V.string(), V.number()) // [string, number]\n' +
        '}',
    );
    done();
  });
  it('should fail when given non tuple for tuple', done => {
    const data = { tick: { from: '10/2/1991', ms: 1000 } };
    const decode = createDecoder({ tick: V.tuple(V.string(), V.number()) });
    expect(() => decode(data as any)).to.be.throw(
      `Expected tuple but got ${formatToJson(data.tick)} at tick`,
    );
    done();
  });
  it('should pass when given two validators of same value type', done => {
    const data = { tick: ['10/2/1991', 1000] as [string, number] };
    const decode = createDecoder({ tick: V.tuple(V.string(), V.number()) });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should pass when given one validators of same value type', done => {
    const data = { tick: ['10/2/1991'] as [string] };
    const decode = createDecoder({ tick: V.tuple(V.string()) });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given schemas as validators of different value type', done => {
    const data = { tick: ['10/2/1991', 1000] as [string, number] };
    const decode = createDecoder({ tick: V.tuple(V.string(), V.boolean()) });
    expect(() => decode(data as any)).to.throw(
      `Expected boolean but got ${formatToJson(data.tick[1])} at tick[1]`,
    );
    done();
  });
  it('should pass when given schemas as validators of same value type', done => {
    const data = {
      tick: [{ from: '10/2/1991' }, { ms: 1000 }] as [
        { from: string },
        { ms: number },
      ],
    };
    const decode = createDecoder({
      tick: V.tuple({ from: V.string() }, { ms: V.number() }),
    });
    expect(decode(data)).to.eq(data);
    done();
  });
  it('should pass when given schemas as validators of same array value type', done => {
    const data = {
      tick: [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 300] }] as [
        { from: string[] },
        { ms: number[] },
      ],
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
    expect(() => decode(data as any)).to.throw(
      `Expected number but got ${formatToJson(
        data.tick[1]?.ms?.[1],
      )} at tick[1].ms[1]`,
    );
    done();
  });

  it('should pass when given nested tuple with same type', done => {
    const schema = {
      tick: V.tuple(
        V.tuple(V.tuple(V.number(), V.number()), V.tuple(V.number(), V.number())),
        V.tuple(V.tuple(V.number(), V.number()), V.tuple(V.number(), V.number())),
      ),
    };
    const data: toNativeType<typeof schema> = {
      tick: [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given nested tuple with different type', done => {
    const schema = {
      tick: V.tuple(
        V.tuple(V.tuple(V.number(), V.number()), V.tuple(V.number(), V.number())),
        V.tuple(V.tuple(V.number(), V.number()), V.tuple(V.number(), V.number())),
      ),
    };
    const data = {
      tick: [
        [1, 2, [3, 4]],
        [
          [5, 6],
          [7, 8],
        ],
      ],
    };
    const decode = createDecoder(schema);
    expect(() => decode(data as any)).to.throw(
      `Expected tuple of equal length but got ${formatToJson(
        data.tick[0],
      )} at tick[0]`,
    );
    done();
  });
});
