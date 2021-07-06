import { expect } from 'chai';

import { createDecoder } from '../src/decode';
import { formatToJson } from '../src/errorFormatter';
import { toNativeType } from '../src/toNativeType';
import * as V from '../src/validators';

describe('json decoder for complex schemas', () => {
  it('should pass when matched ultra big json', done => {
    const schema = {
      name: { firstName: V.string(), lastName: V.string() },
      id: V.number(),
      friends: V.array(V.number()),
      isAdult: V.boolean(),
      yeahNullSucks: V.nil(),
      fbiAgent: {
        no: { they: { wont: { see: { this: { fbiAgentId: V.string() } } } } },
      },
      wtf: V.array({
        letter: V.string(),
        type: V.tuple(V.string(), V.number()),
        nextLetter: V.union(V.nil(), V.string()),
      }),
    };
    const data: toNativeType<typeof schema> = {
      name: { firstName: 'dummy', lastName: 'master' },
      id: 634876,
      friends: [65346, 34478, 86426],
      isAdult: false,
      yeahNullSucks: null,
      fbiAgent: {
        no: { they: { wont: { see: { this: { fbiAgentId: 'nope' } } } } },
      },
      wtf: [
        { letter: 'w', type: ['letter', 1], nextLetter: 't' },
        { letter: 't', type: ['letter', 2], nextLetter: 'f' },
        { letter: 'f', type: ['letter', 3], nextLetter: null },
      ],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it("should fail when ultra big json didn't match", done => {
    const data = {
      name: { firstName: 'dummy', lastName: 'master' },
      id: 634876,
      friends: [65346, 34478, 86426],
      isAdult: false,
      yeahNullSucks: null,
      fbiAgent: {
        no: { they: { wont: { see: { this: { fbiAgentId: 'nope' } } } } },
      },
      wtf: [
        { letter: 'w', type: ['letter', 1], nextLetter: 't' },
        { letter: 't', type: ['letter', 2], nextLetter: 'f' },
        { letter: 'f', type: ['letter', 3], nextLetter: null },
      ],
    };
    const decode = createDecoder({
      name: { firstName: V.string(), lastName: V.string() },
      id: V.number(),
      friends: V.array(V.number()),
      isAdult: V.boolean(),
      yeahNullSucks: V.nil(),
      fbiAgent: {
        no: { they: { wont: { see: { this: { fbiAgentId: V.string() } } } } },
      },
      wtf: V.array({
        letter: V.string(),
        type: V.tuple(V.string(), V.number()),
        nextLetter: V.union(V.number(), V.string()),
      }),
    });
    expect(() => decode(data as any)).to.be.throw(
      'Expected union to match one of specified types but none matched for value null at wtf[2].nextLetter',
    );
    done();
  });
  it("should fail when ultra big json didn't match the most inner string field", done => {
    const data = {
      name: { firstName: 'dummy', lastName: 'master' },
      id: 634876,
      friends: [65346, 34478, 86426],
      isAdult: false,
      yeahNullSucks: null,
      fbiAgent: {
        no: { they: { wont: { see: { this: { fbiAgentId: 'LoL' } } } } },
      },
      wtf: [
        { letter: 'w', type: ['letter', 1], nextLetter: 't' },
        { letter: 't', type: ['letter', 2], nextLetter: 'f' },
        { letter: 'f', type: ['letter', 3], nextLetter: 'null' },
      ],
    };
    const decode = createDecoder({
      name: { firstName: V.string(), lastName: V.string() },
      id: V.number(),
      friends: V.array(V.number()),
      isAdult: V.boolean(),
      yeahNullSucks: V.nil(),
      fbiAgent: {
        no: { they: { wont: { see: { this: { fbiAgentId: V.number() } } } } },
      },
      wtf: V.array({
        letter: V.string(),
        type: V.tuple(V.string(), V.number()),
        nextLetter: V.union(V.number(), V.string()),
      }),
    });
    expect(() => decode(data as any)).to.be.throw(
      `Expected number but got ${formatToJson(
        data.fbiAgent.no.they.wont.see.this.fbiAgentId,
      )} at fbiAgent.no.they.wont.see.this.fbiAgentId`,
    );
    done();
  });
});
