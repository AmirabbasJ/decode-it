# decode-it

Friendly json decoder with runtime type support

# What the heck is a json decoder?

Json decoder guarantees that the json you've got matches the json you expect to get

# Where can it be useful?

Whenever you have to deal with json comping from the input e.g when you're reading
from a json file or fetching json data (yes, the everyday work you do)

# How can I use it?

first you should install this package 
you can do so by:

```bash
$ npm install decode-it
```

Then you specify a schema (or you might call it an interface) And it will throw as soon
as it finds out that the schema doesn't match the received json

# Why do I need this? I use typescript, I can already do that without this with the magic of interfaces

Well... Not exactly, you might **think** doing something that will result in the same
functionally as what json decoder is trying to do, but no, let me demonstrate it for
you

```typescript
interface Data {
  name: string;
  gender: 'female' | 'male';
}

fetch('https://example.com')
  .then(res => res.json())
  .then((data: Data) => console.log(data));
```

But what happens if I try to mess up the interface like so that the name becomes
number with no gender field

```typescript
interface Data {
  name: number;
}
```

If the json is the same as the previous Data interface (with name being string) it
won't throw an error You can try it, you'll see that in the console.log that the
object you got differs from your interface and you've got no errors Why you ask?
Because all this type checking only happens in compile time meaning these types are
all just predictions And when do we get the json? At runtime (where no typescript
type exists) so you need some kind of "typescript interface like" support in runtime,
and that's where json decoders come in Similar to how you define an interface for an
object in typescript You define an schema for a json (object) and it will throw some
helpful error messages as soon as it finds a mismatch and the good part is that all
of this happens at runtime!

# Usage

## createDecoder:

createDecoder is a higher order function which accepts a valid schema as the input
and then returns a function which accepts a json as the input and returns the json if
it matched the given schema or throws if it found a mismatch e.g:

```typescript
import { createDecoder } from 'decode-it';
const decode = createDecoder(schema);
const data = decode(susData); // if the schema didn't match the susData it will throw
```

## schema:

schema can be either an object which include validators or just an array validator
(in case of array jsons)

```typescript
import { V } from 'decode-it';

const schema = {
  name: V.string(), // 🟢 "Mohammad" 🔴 536574
  hobbies: V.array(V.string()), // 🟢 ["programming", "running", "sleeping"] 🔴 ["programming", 12312341234 ]
};
```

## validators:

a validator is function which is called on a field and asserts that the type matches
the validator there are two types of validators one which take no input, you can call
them primitive validator for now which include:

### V.string: a validator which asserts this value is of type string

```typescript
import { V } from 'decode-it';

const schema = {
  firstName: V.string(), //🟢 "Ali" 🔴 null
  lastName: V.string(), // 🟢 "string" 🔴 true
};
```

### V.number: a validator which asserts this value is of type number

```typescript
import { V } from 'decode-it';

const schema = {
  age: V.number(), //🟢 17 🔴 "17"
  weight: V.number(), // 🟢 63 🔴 { kg: 63 }
};
```

### V.boolean: a validator which asserts this value is of type boolean

```typescript
import { V } from 'decode-it';

const schema = {
  isAdult: V.boolean(), //🟢 false 🔴 "yes"
  isMale: V.boolean(), // 🟢 true 🔴 ["prefer not to say"]
};
```

### V.nil: a validator which asserts this value is of type null

```typescript
import { V } from 'decode-it';

const schema = {
  yeahNullSucks: V.nil(), //🟢 null 🔴 "no null is the best"
  nilIsTheSameAsNull: V.nil(), // 🟢 null 🔴 undefined
};
```

the second group take (or can take) an input or more, you can call them custom
validators:

### V.literal: a validator which takes any value and asserts that the input is exactly equal as this value (note: a deep comparison is done here) e.g:

```typescript
import { V } from 'decode-it';

const schema = {
  name: V.literal('Alfred'), // 🟢 "Alfred" 🔴 "alfred"
  state: V.literal({ happy: true }), // 🟢 { happy: true } 🔴 { happy: false }
};
```

### V.array: a validator which takes another validator and asserts all validators pass for each element of this array value e.g:

```typescript
import { V } from 'decode-it';

const schema = {
  players: V.array(V.string()), // 🟢 [] 🟢 ["lazy-bones", "ass-kicker", "player256346"] 🔴 [1, 3, 4]
  friendsSkills: V.array({ name: V.string(), id: V.number() }), // 🟢 [] 🟢 [{ name: "gaming", id: 1574234 }] 🔴 [{ name: "gaming", id: "1574234" }]
  uselessField: V.array(V.array(V.nil())), // 🟢 [] 🟢 [[null, null]] 🔴 [null,null]
};
```

### V.union: a validator which takes any number of validators (starting from two) and asserts if this value passes any of the given validators

(note: this validator doesn't support scheme (object) types as validators and it's
better to avoid using this validator as much as you can because this type is rarely
useful when it comes to jsons) e.g:

```typescript
import { V } from 'decode-it';

const schema = {
  countryArea: V.union(V.string(), V.number()), // 🟢 1648195 🟢 "1.648 million km^2" 🔴 null
  cities: V.union(
    V.array({ name: V.string(), visited: V.boolean() }),
    V.array(V.string()),
  ), // 🟢 [{ name: "Tehran", visited: true }] 🟢 ["Tehran"] 🔴 false
};
```

### V.optional: a validator which takes one validator and asserts this value can be undefined or it should pass the validator

```typescript
import { V } from 'decode-it';

const schema = {
  favoriteLang: V.optional(V.string()), // 🟢 undefined 🟢 "typescript" 🔴 null
  favoriteLangCapabilities: V.optional({
    isFunctional: V.boolean(),
    typeSystem: V.union(V.literal('static'), V.literal('dynamic')),
  }), // 🟢 undefined 🟢 { isFunctional: true, typeSystem: "static" } 🔴  { isFunctional: 'no', typeSystem: "static" }
};
```

### V.tuple: a validator which takes any number of validators and asserts if the given value is tuple of given validators

```typescript
import { V } from 'decode-it';

const schema = {
  tick: V.tuple(V.string(), V.number()), // 🟢 ['10/2/1991', 1000] 🔴 ['10/2/1991', 1000, 2000] 🔴 ['10/2/1991'] 🔴 []
  verboseTick: V.tuple({ from: V.array(V.string()) }, { ms: V.array(V.number()) }), // 🟢 [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 300] }] 🔴 [{ from: ['10/2/1991', '9/7/2007'] }, { ms: [1000, 'haha'] }]
};
```

## toNativeType:

say you've came this far and created an schema e.g:

```typescript
const userSchema = {
  name: { firstName: V.string(), lastName: V.string() },
  age: V.number(),
  isAdult: V.boolean(),
  birthDate: V.tuple(V.number(), V.number(), V.number()),
  pet: V.optional(V.union(V.literal('cat'), V.literal('dog'), V.literal('chick'))),
};

const usersSchema = V.array(userSchema);
```

ok so you'd also need an typescript interface too right? of course you do! well you
can just write it yourself lazy bones, just convert each validator to it's own
typescript type, you can do a simple task as that right? problem solved :))

you're not gonna do that? that's completely fine! we programmers hate overdoing or
more specifically repeating ourselves we like to keep things DRY as possible

introducing `toNativeType` type constructor it does exactly what you'd expect,
magically converting your schema to the appropriate typescript type. how to use it?
simple:

```typescript
const userSchema = {
  name: { firstName: V.string(), lastName: V.string() },
  age: V.number(),
  isAdult: V.boolean(),
  birthDate: V.tuple(V.number(), V.number(), V.number()),
  pet: V.optional(V.union(V.literal('cat'), V.literal('dog'), V.literal('chick'))),
};

const usersSchema = V.array(userSchema);

type User = toNativeType<typeof userSchema>;
type Users = toNativeType<typeof usersSchema>; // or just simply User[]
```

boom, now you cover both runtime and compile type, with only one schema.

oh and if you don't trust this api or package in whole, this library is completely
tested you can take look at them in the source code. and guess what? the examples
used here (validator examples) are also tested, just check the
`test/examples.spec.ts` even tough, if you found any bugs or issues, I'd appreciate
it
