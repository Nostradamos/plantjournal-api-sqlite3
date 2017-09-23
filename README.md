[![Build Status](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite.svg?branch=master)](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite)
[![dependencies Status](https://david-dm.org/Nostradamos/plantjournal/status.svg)](https://david-dm.org/Nostradamos/plantjournal) [![devDependencies Status](https://david-dm.org/Nostradamos/plantjournal-api-sqlite/dev-status.svg)](https://david-dm.org/Nostradamos/plantjournal?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/Nostradamos/plantjournal-api-sqlite/badge.svg?branch=master)](https://coveralls.io/github/Nostradamos/plantjournal-api-sqlite?branch=master)

plantjournal-api-sqlite
=======================

This repo contains a plantJournal API implementation using sqlite3 as the database engine.

API
======

## Connect to sqlite3 database

You can connect to a sql database file with:
```javascript
var pj = new plantJournal();
await pj.connect('./database.sql');
```

Or if you want to keep the database in memory, use:
```javascript
var pj = new plantJournal();
await pj.connect(':memory:');
```

To catch errors, surround `pj.connect()` with a try/catch block.

```javascript
var pj = new plantJournal();
try {
    await pj.connect('./database.sql'): // same for :memory:
} catch(err) {
    // ToDo: handle error here
}
```


## Create a model record

We have a variety of models with different attributes. See "Models/Tables" for detailed information and a list of all models. This includes Family, Generation, Plant....

To create a new model record, you have to call `pj.{Model}.create({options})`, where `{Model}` is the model name, and `{options}` an object with attributes this new model record should have. Check out "Models/Tables" to get more detailed information which attributes are required (and therefore have to be set if you don't want to get any errors) and which additional/optional attributes you can set.

**Example #1:**
```javascript
await pj.Family.create({
    familyName: 'testFamily'
});
```

**Example #2:**
```javascript
await pj.Plant.create({
    plantName: 'Some chili plant',
    genotypeId: 3
});
```

If you create a new record, `pj.{Model}.create{)` returns the newly created record as an object.

**Example #1:**
```javascript
let family = pj.Family.create({
    familyName: 'testFamily'
});

// console.log(family);
// {
//   'families': {
//      1: {
//        familyName: 'testFamily',
//        familyDescription: '',
//        familyCreatedAt: 12354,
//        familyModifiedAt: 12354
//      },
// }
```

Models/Tables
=============

## Family

**Attribute:** Name of the attribute  
**Type:** Type of this attribute  
**Default:** Has an default value, not needed to specify this on create (if internal flag is selected too, you can't even).  
**Required:** Attribute is required on create.  
**Internal:** This attribute gets filled in internally, and can only get modified indirectly by api user.

|     Attribute     |   Type   | Required |      Default      | Internal | Description |
| ----------------- | -------- | -------- | ----------------- | -------- | ----------- |
| familyId          | int      |          | AUTO_INCREMENT    | *        |             |
| familyName        | text     | *        |                   |          |             |
| familyDescription | text     |          | ""                |          |             |
| familyCreatedAt   | datetime |          | CURRENT_TIMESTAMP | *        |             |
| familyModifiedAt  | datetime |          | CURRENT_TIMESTAMP | *        |             |

## Generation (=generations)

| Attribute             | Type      | Required | Default           | Internal | Description |
| --------------------- | --------- | -------- | ----------------- | -------- | ----------- |
| generationId          | int       |          | AUTO_INCREMENT    | *        |             |
| generationName        | text      |          |                   |          |             |
| generationDescription | text      |          | ""                |          |             |
| generationParents     | plantId[] |          | []                |          |             |
| generationCreatedAt   | datetime  |          | CURRENT_TIMESTAMP | *        |             |
| generationModifiedAt  | datetime  |          | CURRENT_TIMESTAMP | *        |             |
| familyId              | familyId  | *        |                   |          |             |

## Genotype (=genotypes)

|      Attribute      |     Type     | Required |      Default      | Internal | Description |
| ------------------- | ------------ | -------- | ----------------- | -------- | ----------- |
| genotypeId          | int          |          | AUTO_INCREMENT    | *        |             |
| genotypeName        | text         |          |                   |          |             |
| genotypeDescription | text         |          | ""                |          |             |
| genotypeCreatedAt   | datetime     |          | CURRENT_TIMESTAMP | *        |             |
| genotypeModifiedAt  | datetime     |          | CURRENT_TIMESTAMP | *        |             |
| generationId        | generationId | *        |                   |          |             |

## Plant (=plants)

|        Attribute         |    Type    | Required |      Default      | Internal | Description |
| ------------------------ | ---------- | -------- | ----------------- | -------- | ----------- |
| plantId                  | int        |          | AUTO_INCREMENT    | *        |             |
| plantName                | text       | *        |                   |          |             |
| plantSex                 | text       |          | null              |          |             |
| plantClonedFrom          | plantId    |          | null              |          |             |
| plantDescription         | text       |          | ""                |          |             |
| plantCreatedAt           | datetime   |          | CURRENT_TIMESTAMP | *        |             |
| plantModifiedAt          | datetime   |          | CURRENT_TIMESTAMP | *        |             |
| genotypeId               | genotypeId | *        |                   |          |             |
| mediumId (unimplemented) | mediumId   | *        |                   |          |             |

## Medium (=mediums)

|     Attribute     |     Type      | Required |      Default      | Internal | Description |
| ----------------- | ------------- | -------- | ----------------- | -------- | ----------- |
| mediumId          | int           |          | AUTO_INCREMENT    | *        |             |
| mediumName        | text          | *        | ""                |          |             |
| mediumDescription | text          |          | ""                |          |             |
| mediumCreatedAt   | datetime      |          | CURRENT_TIMESTAMP | *        |             |
| mediumModifiedAt  | datetime      |          | CURRENT_TIMESTAMP | *        |             |
| environmentId     | environmentId | *        |                   |          |             |

## Environment

|       Attribute        |   Type   | Required |      Default      | Internal | Description |
| ---------------------- | -------- | -------- | ----------------- | -------- | ----------- |
| environmentId          | int      |          | AUTO_INCREMENT    | *        |             |
| environmentName        | text     | *        |                   |          |             |
| environmentDescription | text     |          |                   |          |             |
| environmentCreatedAt   | datetime |          | CURRENT_TIMESTAMP | *        |             |
| environmentModifiedAt  | datetime |          | CURRENT_TIMESTAMP | *        |             |

## Journal (unimplemented)

If Required is filled with "\*\*", you can only set/get this attribute if the logFor attribute matches. So for example you can only
get plantId if logFor is "plant" and you can only get mediumId if logFor is "medium etc.

| Attribute         | Type          | Required | Default           | Internal | Description                                                             |
| ----------------- | ------------- | -------- | ----------------- | -------- | ----------------------------------------------------------------------- |
| journalId         | int           |          | AUTO_INCREMENT    | *        |                                                                         |
| journalTimestamp  | datetime      | *        |                   |          |                                                                         |
| journalType       | text          | *        |                   |          |                                                                         |
| journalValue      | json          | *        |                   |          |                                                                         |
| journalCreatedAt  | datetime      |          | CURRENT_TIMESTAMP | *        |                                                                         |
| journalModifiedAt | datetime      |          | CURRENT_TIMESTAMP | *        |                                                                         |
| plantId           | plantId       | **       |                   |          | Has to reference an existing plant if journalFor = "plant".             |
| mediumId          | mediumId      | **       |                   |          | Has to reference an existing medium if journalFor = "medium".           |
| environmentId     | environmentId | **       |                   |          | Has to reference an existing environment if journalFor = "environment". |

# Query Operators

## Operators for most attributes
NOTE: This excludes the special cases `generationParents` and `journalValue`. Scroll to the next sections to get details about the operators available for those special cases.

### $eq (equals)
### $neq (equals not)
### $gt (greater than)
### $gte (greater than equals)
### $lt (lower than)
### $lte (lower than equals)
### $in (in)
### $nin (not in)
### $like (like)
### $nlike (not like)

## Operators for `generationParents`
### $eq
### $neq
### $has
### $nhas
### $len

## Operators for `journalValue`
### $eq (equals)
### $neq (equals not)
### $gt (greater than)
### $gte (greater than equals)
### $lt (lower than)
### $lte (lower than equals)
### $in (in)
### $nin (not in)
### $like (like)
### $nlike (not like)
### $has
### $nhas
### $type
### $len

# Journal Types

## `log`

### Example:
```
{
    journalType: 'log',
    journalValue: 'Lorem Ipsum
    Asd dasldk'
}
```


## `water`

### Example:
```
{
    journalType: 'water',
    journalValue: {
        amountL: 13.0,
        ec: 0.8
        ph: 6.5
        fertRatio: {
            n: 5
            p: 7
        },
        fertAmountML: {
            n: 1.0
        },
        fertilizers: ['Hakaphos Green', 'Hakaphos Blue']
    }
}
```




# ToDo
* Implement files/pictures/media
* Add .on events
* Make it possible to create plants without need of generations/family?!
* Add resolveParents to find?!
* Add strain?!
* Don't always select id attributes
* Harden API against invalid user input
* Improve performance for sql by only joining tables if necessary
* Use CONSTANTS. and not hardcoded attribute/table names

# Development Notes/Coding Style

* Always use explicit column names (explicit => including table name) in your
  queries as soon as you join different tables. Why? Because for all
  foreign keys we use the same column name in source and destination table.
  SQLite can't know which table you mean, so we just use explicit column names
  for everything. Eg: `generations.familyId` references `families.familyId`.

* Try to use CONSTANTS wherever you can, especially for attributes. This makes
  it easier to change the attribute or variable names and reduces the risk of
  misspelling any constant, because we throw an error if you try to read an
  undefined property from constants (thanks to es6 proxies and zealot).

* Use lamda expression for all anonymous functions. For named functions (also
  assigned functions) use `function()` style. If the shorted lamda expression
  allows you to fit max line length for named functions, feel free to use it.
