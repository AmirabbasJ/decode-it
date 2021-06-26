import { expect } from 'chai';

import { createDecoder, Json, Schema } from '../src/decode';
import * as V from '../src/validators';

describe('json decoder when passing invalid parameter types', () => {
  it('should fail when given non object as schema', done => {
    const createInvalidDecoder = () =>
      createDecoder('not schema' as unknown as Schema);
    expect(createInvalidDecoder).to.throw(
      `Expected schema to be an object but got not schema`,
    );
    done();
  });
  it('should fail when given non validator to a schema', done => {
    const createInvalidDecoder = () =>
      createDecoder({ thisIsAField: 'bool' } as unknown as Schema);
    expect(createInvalidDecoder).to.throw(
      `Expected schema fields to be an validator or another schema but got bool at thisIsAField`,
    );
    done();
  });
  it('should fail when given nested non validator to a schema', done => {
    const createInvalidDecoder = () =>
      createDecoder({
        thisIsAField: { hey: true, boo: { see: true } },
      } as unknown as Schema);
    expect(createInvalidDecoder).to.throw(
      `Expected schema fields to be an validator or another schema but got true at thisIsAField.hey`,
    );
    done();
  });
  it('should fail when given non validator which is a function to a schema', done => {
    const wowString = () => 'wow string';
    const data = { thisIsAField: { hey: 'wow string' } };
    const decode = createDecoder({
      thisIsAField: { hey: wowString },
    } as unknown as Schema);
    expect(() => decode(data)).to.throw(
      `Expected schema fields to be an validator or another schema but got non validator function at thisIsAField.hey\n` +
        `hint: it is possible that you forgot to call the validator e.g this is wrong:\n` +
        `{\n` +
        `  field: V.string\n` +
        `}\n` +
        `the right way is this:\n` +
        `{\n` +
        `  field: V.string()\n` +
        `}\n` +
        `so as a rule of thumb: "you are always calling the validator"`,
    );
    done();
  });

  it('should fail when passed non json to decoder', done => {
    const data = 'wow';
    const decode = createDecoder({
      thisIsAField: { hey: V.string(), boo: { see: V.boolean() } },
    });
    expect(() => decode(data as unknown as Json)).to.throw(
      `Expected json to be an object but got wow`,
    );
    done();
  });
});
