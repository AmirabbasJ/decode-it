import { expect } from 'chai';

import { toNativeType } from '../src';
import { createDecoder } from '../src/decode';
import { formatToJson } from '../src/errorFormatter';
import * as V from '../src/validators';

// eslint-disable-next-line max-lines-per-function
describe('json decoder for README examples', () => {
  it('should pass for string example when given string fields', done => {
    const schema = {
      firstName: V.string(),
      lastName: V.string(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      firstName: 'Mohammad',
      lastName: 'Mohammadi',
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for string example when not including the string field', done => {
    const schema = {
      firstName: V.string(),
      lastName: V.string(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      firstName: 'Mohammad',
    } as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected string but got ${formatToJson(data?.lastName)} at lastName`,
    );
    done();
  });
  it('should pass for number example when given number fields', done => {
    const schema = {
      age: V.number(),
      weight: V.number(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      age: 26,
      weight: 67,
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for number example when not passing number fields', done => {
    const schema = {
      age: V.number(),
      weight: V.number(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      age: 26,
      weight: '67Kg',
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected number but got ${formatToJson(data.weight)} at weight`,
    );
    done();
  });
  it('should pass for boolean example when given boolean fields', done => {
    const schema = {
      isAdult: V.boolean(),
      isMale: V.boolean(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      isAdult: true,
      isMale: false,
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for boolean example when not passing boolean fields', done => {
    const schema = {
      isAdult: V.boolean(),
      isMale: V.boolean(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      isAdult: false,
      isMale: 'would prefer not to say',
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected boolean but got ${formatToJson(data.isMale)} at isMale`,
    );
    done();
  });
  it('should pass for null example when given null fields', done => {
    const schema = {
      yeahNullSucks: V.nil(),
      nilIsTheSameAsNull: V.nil(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      yeahNullSucks: null,
      nilIsTheSameAsNull: null,
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for null example when not passing null fields', done => {
    const schema = {
      yeahNullSucks: V.nil(),
      nilIsTheSameAsNull: V.nil(),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      yeahNullSucks: null,
      nilIsTheSameAsNull: undefined,
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected null but got ${formatToJson(
        data.nilIsTheSameAsNull,
      )} at nilIsTheSameAsNull`,
    );
    done();
  });
  it('should pass for first example with the right values', done => {
    const schema = {
      name: V.string(),
      hobbies: V.array(V.string()),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      name: 'Mohammad',
      hobbies: ['programming', 'running', 'sleeping'],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for first example with the wrong values', done => {
    const schema = {
      name: V.string(),
      hobbies: V.array(V.string()),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      name: 'Mohammad',
      hobbies: ['programming', 123412341234, 'sleeping'],
    } as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected string but got ${formatToJson(data.hobbies[1])} at hobbies[1]`,
    );
    done();
  });
  it('should pass for literal example with the right values', done => {
    const schema = {
      name: V.literal('Alfred'),
      state: V.literal({ happy: true }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      name: 'Alfred',
      state: { happy: true },
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for literal example with the wrong first values', done => {
    const schema = {
      name: V.literal('Alfred'),
      state: V.literal({ happy: true }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      name: 'alfred',
      state: { happy: true },
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected "Alfred" but got ${formatToJson(data.name)} at name`,
    );
    done();
  });
  it('should fail for literal example with the wrong second values', done => {
    const schema = {
      name: V.literal('Alfred'),
      state: V.literal({ happy: true }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      name: 'Alfred',
      state: { happy: false },
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected ${formatToJson({ happy: true })} but got ${formatToJson(
        data.state,
      )} at state`,
    );
    done();
  });
  it('should fail for literal example with the wrong both values', done => {
    const schema = {
      name: V.literal('Alfred'),
      state: V.literal({ happy: true }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      name: 'alfred',
      state: { happy: false },
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected "Alfred" but got ${formatToJson(data.name)} at name`,
    );
    done();
  });
  it('should pass for array example with the right values', done => {
    const schema = {
      players: V.array(V.string()),
      friendsSkills: V.array({ name: V.string(), id: V.number() }),
      uselessField: V.array(V.array(V.nil())),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      players: ['lazy-bones', 'ass-kicker', 'player256346'],
      friendsSkills: [{ name: 'gaming', id: 1574234 }],
      uselessField: [[null, null]],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should pass for array example with the right values being empty arrays', done => {
    const schema = {
      players: V.array(V.string()),
      friendsSkills: V.array({ name: V.string(), id: V.number() }),
      uselessField: V.array(V.array(V.nil())),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      players: [],
      friendsSkills: [],
      uselessField: [],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for array example with the wrong third values', done => {
    const schema = {
      players: V.array(V.string()),
      friendsSkills: V.array({ name: V.string(), id: V.number() }),
      uselessField: V.array(V.array(V.nil())),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      players: ['lazy-bones', 'ass-kicker', 'player256346'],
      friendsSkills: [{ name: 'gaming', id: 1574234 }],
      uselessField: [null, null],
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected array but got ${formatToJson(
        data.uselessField[0],
      )} at uselessField[0]`,
    );
    done();
  });
  it('should pass for union example with the right values first match', done => {
    const schema = {
      countryArea: V.union(V.string(), V.number()),
      cities: V.union(
        V.array({ name: V.string(), visited: V.boolean() }),
        V.array(V.string()),
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      countryArea: 1648195,
      cities: [{ name: 'Tehran', visited: true }],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should pass for union example with the right values second match', done => {
    const schema = {
      countryArea: V.union(V.string(), V.number()),
      cities: V.union(
        V.array({ name: V.string(), visited: V.boolean() }),
        V.array(V.string()),
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      countryArea: '1.648 million km^2',
      cities: ['Tehran'],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for union example with the wrong both values for first field', done => {
    const schema = {
      countryArea: V.union(V.string(), V.number()),
      cities: V.union(
        V.array({ name: V.string(), visited: V.boolean() }),
        V.array(V.string()),
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      countryArea: { area: 1648195 },
      cities: [{ name: 'Tehran', visited: true }],
    } as unknown as Schema;
    const decode = createDecoder(schema);

    expect(() => decode(data)).to.throw(
      `Expected union to match one of specified types but none matched for value ${formatToJson(
        data.countryArea,
      )} at countryArea`,
    );
    done();
  });
  it('should fail for union example with the wrong both values for second field', done => {
    const schema = {
      countryArea: V.union(V.string(), V.number()),
      cities: V.union(
        V.array({ name: V.string(), visited: V.boolean() }),
        V.array(V.string()),
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      countryArea: '1.648 million km^2',
      cities: 'Tehran',
    } as unknown as Schema;
    const decode = createDecoder(schema);

    expect(() => decode(data)).to.throw(
      `Expected union to match one of specified types but none matched for value ${formatToJson(
        data.cities,
      )} at cities`,
    );
    done();
  });
  it('should pass for optional example with the right values', done => {
    const schema = {
      favoriteLang: V.optional(V.string()),
      favoriteLangCapabilities: V.optional({
        isFunctional: V.boolean(),
        typeSystem: V.union(V.literal('static'), V.literal('dynamic')),
      }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      favoriteLang: 'Haskell',
      favoriteLangCapabilities: { isFunctional: true, typeSystem: 'static' },
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for optional example with the wrong values for the first field', done => {
    const schema = {
      favoriteLang: V.optional(V.string()),
      favoriteLangCapabilities: V.optional({
        isFunctional: V.boolean(),
        typeSystem: V.union(V.literal('static'), V.literal('dynamic')),
      }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      favoriteLang: null,
      favoriteLangCapabilities: { isFunctional: true, typeSystem: 'static' },
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected undefined or string but got ${formatToJson(
        data.favoriteLang,
      )} at favoriteLang`,
    );
    done();
  });
  it('should fail for optional example with the wrong values for the second field', done => {
    const schema = {
      favoriteLang: V.optional(V.string()),
      favoriteLangCapabilities: V.optional({
        isFunctional: V.boolean(),
        typeSystem: V.union(V.literal('static'), V.literal('dynamic')),
      }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      favoriteLang: 'Elixir',
      favoriteLangCapabilities: { isFunctional: false, typeSystem: null },
    } as unknown as Schema;
    const decode = createDecoder(schema);

    expect(() => decode(data)).to.throw(
      `Expected undefined or specified schema but got ${formatToJson(
        data?.favoriteLangCapabilities?.typeSystem,
      )} at favoriteLangCapabilities.typeSystem`,
    );
    done();
  });
  it("should pass for optional example when not including the field or it's undefined", done => {
    const schema = {
      favoriteLang: V.optional(V.string()),
      favoriteLangCapabilities: V.optional({
        isFunctional: V.boolean(),
        typeSystem: V.union(V.literal('static'), V.literal('dynamic')),
      }),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      favoriteLang: undefined,
    };
    const decode = createDecoder(schema);

    expect(decode(data)).to.eq(data);
    done();
  });
  it('should pass for tuple example with the right values', done => {
    const schema = {
      tick: V.tuple(V.string(), V.number()),
      verboseTick: V.tuple(
        { from: V.array(V.string()) },
        { ms: V.array(V.number()) },
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      tick: ['10/2/1991', 1000],
      verboseTick: [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 300] }],
    };
    const decode = createDecoder(schema);
    expect(decode(data)).to.be.eq(data);
    done();
  });
  it('should fail for tuple example with the wrong values empty array first field', done => {
    const schema = {
      tick: V.tuple(V.string(), V.number()),
      verboseTick: V.tuple(
        { from: V.array(V.string()) },
        { ms: V.array(V.number()) },
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      tick: [],
      verboseTick: [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 300] }],
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected string but got ${formatToJson(data.tick[0])} at tick[0]`,
    );
    done();
  });
  it('should fail for tuple example with the wrong values first field', done => {
    const schema = {
      tick: V.tuple(V.string(), V.number()),
      verboseTick: V.tuple(
        { from: V.array(V.string()) },
        { ms: V.array(V.number()) },
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      tick: ['10/2/1991', 1000, 2000],
      verboseTick: [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 300] }],
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected tuple of equal length but got ${formatToJson(data.tick)} at tick`,
    );
    done();
  });
  it('should fail for tuple example with the wrong values second field', done => {
    const schema = {
      tick: V.tuple(V.string(), V.number()),
      verboseTick: V.tuple(
        { from: V.array(V.string()) },
        { ms: V.array(V.number()) },
      ),
    };
    type Schema = toNativeType<typeof schema>;
    const data: Schema = {
      tick: ['10/2/1991', 1000],
      verboseTick: [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 'haha'] }],
    } as unknown as Schema;
    const decode = createDecoder(schema);
    expect(() => decode(data)).to.throw(
      `Expected number but got ${formatToJson(
        data.verboseTick[1]?.ms?.[1],
      )} at verboseTick[1].ms[1]`,
    );
    done();
  });
  it('should pass for the last example with the same value types', done => {
    const userSchema = {
      name: { firstName: V.string(), lastName: V.string() },
      age: V.number(),
      isAdult: V.boolean(),
      birthDate: V.tuple(V.number(), V.number(), V.number()),
      pet: V.optional(
        V.union(V.literal('cat'), V.literal('dog'), V.literal('chick')),
      ),
    };

    const usersSchema = V.array(userSchema);

    const decodeUser = createDecoder(userSchema);
    const decodeUsers = createDecoder(usersSchema);

    type User = toNativeType<typeof userSchema>;
    type Users = toNativeType<typeof usersSchema>; // or just simply User[]
    const Mohammad: User = {
      name: { firstName: 'Mohammad', lastName: 'whatever' },
      age: 37,
      isAdult: true,
      birthDate: [1984, 10, 2],
      pet: 'cat',
    };
    const Alireza: User = {
      name: { firstName: 'Alireza', lastName: 'whatever' },
      age: 27,
      isAdult: true,
      birthDate: [1984, 10, 2],
      pet: 'cat',
    };
    const users: Users = [Mohammad, Alireza];
    expect(decodeUser(Alireza)).to.eq(Alireza);
    expect(decodeUser(Mohammad)).to.eq(Mohammad);
    expect(decodeUsers(users)).to.eq(users);
    done();
  });
});
