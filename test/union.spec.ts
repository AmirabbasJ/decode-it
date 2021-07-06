import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import { formatToJson } from '../src/errorFormatter';
import { ArrayTwoOrMore } from '../src/helperTypes';
import * as V from '../src/validators';
import { Validator } from '../src/validators/Validator';

describe('json decoder for unions', () => {
  it('should fail when given no validators', done => {
    const data = { name: 'sam' };
    const decode = createDecoder({
      name: V.union.apply(null, [] as unknown[] as ArrayTwoOrMore<Validator<any>>),
    });
    expect(() => decode(data)).to.throw(
      'Expected union to have two or more validators\n' +
        'hint: you passed V.union with less than two validators to choose from\n' +
        'you should pass at least two validators e.g:\n' +
        '{\n' +
        '  field: V.union(V.string(), V.number()) // string or number\n' +
        '}',
    );
    done();
  });
  it('should fail when given only one validator', done => {
    const data = { name: 'sam' };
    const decode = createDecoder({
      name: V.union.apply(null, [V.string()] as unknown[] as ArrayTwoOrMore<
        Validator<any>
      >),
    });
    expect(() => decode(data)).to.throw(
      'Expected union to have two or more validators\n' +
        'hint: you passed V.union with less than two validators to choose from\n' +
        'you should pass at least two validators e.g:\n' +
        '{\n' +
        '  field: V.union(V.string(), V.number()) // string or number\n' +
        '}',
    );
    done();
  });
  it('should pass when given two validators which one of them match', done => {
    const data = { city: 'Tehran' };
    const decode = createDecoder({ city: V.union(V.number(), V.string()) });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given two validators which none of them match', done => {
    const data = { city: 'Tehran' };
    const decode = createDecoder({ city: V.union(V.number(), V.boolean()) });
    expect(() => decode(data as any)).to.throw(
      `Expected union to match one of specified types but none matched for value ${formatToJson(
        data.city,
      )} at city`,
    );
    done();
  });
  it('should pass when given two array validators which one of them match', done => {
    const data = { cities: ['Tehran', 'Ardabil', 'Mashhad', 'Isfahan'] };
    const decode = createDecoder({
      cities: V.union(V.array(V.boolean()), V.array(V.string())),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given two array validators which none of them match', done => {
    const data = { cities: ['Tehran', 'Ardabil', 'Mashhad', 'Isfahan'] };
    const decode = createDecoder({
      cities: V.union(V.array(V.number()), V.array(V.nil())),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected union to match one of specified types but none matched for value ${formatToJson(
        data.cities,
      )} at cities`,
    );
    done();
  });
  it('should pass when given two array of object validators which one of them match', done => {
    const data = {
      cities: [
        { name: 'Tehran', distanceInKm: 50 },
        { name: 'Ardabil', distanceInKm: 44 },
        { name: 'Mashhad', distanceInKm: 76 },
        { name: 'Isfahan', distanceInKm: 79 },
      ],
    };
    const decode = createDecoder({
      cities: V.union(
        V.array({ title: V.string(), distanceInKm: V.number() }),
        V.array({ name: V.string(), distanceInKm: V.string() }),
        V.array({ name: V.string(), distanceInKm: V.number() }),
      ),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given two array of object validators which none of them match', done => {
    const data = {
      cities: [
        { name: 'Tehran', distanceInKm: 50 },
        { name: 'Ardabil', distanceInKm: 44 },
        { name: 'Mashhad', distanceInKm: 76 },
        { name: 'Isfahan', distanceInKm: 79 },
      ],
    };
    const decode = createDecoder({
      cities: V.union(
        V.array({ title: V.string(), distanceInKm: V.number() }),
        V.array({ name: V.string(), distanceInKm: V.string() }),
        V.array({ name: V.string(), visited: V.boolean() }),
      ),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected union to match one of specified types but none matched for value ${formatToJson(
        data.cities,
      )} at cities`,
    );
    done();
  });
});
