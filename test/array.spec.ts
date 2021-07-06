import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import { formatToJson } from '../src/errorFormatter';
import * as V from '../src/validators';

// eslint-disable-next-line max-lines-per-function
describe('json decoder for arrays', () => {
  it('should pass when given an empty array and expecting it to be so', done => {
    const data = { toys: [] };
    const decode = createDecoder({ toys: V.array() });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given non empty array and expecting an empty array', done => {
    const data = { toys: ['car', 'teddyBear', 'nuclearBomb'] };
    const decode = createDecoder({ toys: V.array() });
    expect(() => decode(data as any)).to.throw(
      `Expected empty array but got ${formatToJson(data.toys)} at toys`,
    );
    done();
  });
  it('should pass when given an array of strings and expecting it to be so', done => {
    const data = { toys: ['car', 'teddyBear', 'nuclearBomb'] };
    const decode = createDecoder({ toys: V.array(V.string()) });
    expect(decode(data as any)).to.be.eq(data);
    done();
  });
  it('should pass when given an empty array and expecting an array of strings', done => {
    const data = { toys: [] };
    const decode = createDecoder({ toys: V.array(V.string()) });
    expect(decode(data as any)).to.be.eq(data);
    done();
  });
  it('should pass when given an array of objects and expecting same array of those objects structure', done => {
    const data = {
      toys: [
        { name: 'car', isSafe: true },
        { name: 'teddyBear', isSafe: false },
        { name: 'nuclearBomb', isSafe: true },
      ],
    };
    const decode = createDecoder({
      toys: V.array({ name: V.string(), isSafe: V.boolean() }),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given an array of objects but expecting an array of other object structure', done => {
    const data = {
      toys: [
        { name: 'car', isSafe: true },
        { name: 'teddyBear', isSafe: false },
        { name: 'nuclearBomb', isSafe: true },
      ],
    };
    const decode = createDecoder({
      toys: V.array({
        firstName: V.string(),
        isAdult: V.boolean(),
        age: V.number(),
      }),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected string but got undefined at toys[0].firstName`,
    );
    done();
  });
  it('should pass when given 2D array and expecting 2D array', done => {
    const data = {
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    };
    const decode = createDecoder({
      matrix: V.array(V.array(V.number())),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given 2D array and expecting 2D array of different types', done => {
    const data = {
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    };
    const decode = createDecoder({
      matrix: V.array(V.array(V.string())),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected string but got 1 at matrix[0][0]`,
    );
    done();
  });
  it('should fail when given 1D array and expecting 2D array', done => {
    const data = {
      matrix: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    const decode = createDecoder({
      matrix: V.array(V.array(V.number())),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected array but got 1 at matrix[0]`,
    );
    done();
  });
  it('should pass when given nested array of objects and expecting it with same object structure', done => {
    const data = {
      matrix: [
        [{ value: 1 }, { value: 2 }, { value: 3 }],
        [{ value: 4 }, { value: 5 }, { value: 6 }],
        [{ value: 7 }, { value: 8 }, { value: 9 }],
      ],
    };
    const decode = createDecoder({
      matrix: V.array(V.array({ value: V.number() })),
    });
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail when given nested array of objects and expecting it with other object structure', done => {
    const data = {
      matrix: [
        [{ value: 1 }, { value: 2 }, { value: 3 }],
        [{ value: 4 }, { value: 5 }, { haha: 'destroyed your schema' }],
        [{ value: 7 }, { value: 8 }, { value: 9 }],
      ],
    };
    const decode = createDecoder({
      matrix: V.array(V.array({ value: V.number() })),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected number but got undefined at matrix[1][2].value`,
    );
    done();
  });
  it('should fail when given nested array of objects and expecting it with same object structure but different field type', done => {
    const data = {
      matrix: [
        [{ value: 1 }, { value: 2 }, { value: 3 }],
        [{ value: 4 }, { value: 5 }, { value: 'haha destroyed your schema' }],
        [{ value: 7 }, { value: 8 }, { value: 9 }],
      ],
    };
    const decode = createDecoder({
      matrix: V.array(V.array({ value: V.number() })),
    });
    expect(() => decode(data as any)).to.throw(
      `Expected number but got ${formatToJson(
        data.matrix[1][2].value,
      )} at matrix[1][2].value`,
    );
    done();
  });
});
