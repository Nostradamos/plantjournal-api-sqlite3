[![Build Status](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite.svg?branch=master)](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite)
[![dependencies Status](https://david-dm.org/Nostradamos/plantjournal/status.svg)](https://david-dm.org/Nostradamos/plantjournal) [![devDependencies Status](https://david-dm.org/Nostradamos/plantjournal-api-sqlite/dev-status.svg)](https://david-dm.org/Nostradamos/plantjournal?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/Nostradamos/plantjournal-api-sqlite/badge.svg?branch=master)](https://coveralls.io/github/Nostradamos/plantjournal-api-sqlite?branch=master)

plantjournal-api-sqlite
=======================

This repo contains a plantJournal API implementation using sqlite3 as the database engine.

Models
======

## Family

**Internal:** This attribute gets filled in internally, and can only get modified indirectly by api user.

|     Attribute     |   Type   | Required |      Default      | Internal | Description |
| ----------------- | -------- | -------- | ----------------- | -------- | ----------- |
| familyId          | int      |          | AUTO_INCREMENT    | *        |             |
| familyName        | text     | *        |                   |          |             |
| familyDescription | text     |          | ""                |          |             |
| familyCreatedAt   | datetime |          | CURRENT_TIMESTAMP | *        |             |
| familyModifiedAt  | datetime |          | CURRENT_TIMESTAMP | *        |             |

## Generation

|       Attribute       |   Type    | Required |      Default      | Internal | Description |
| --------------------- | --------- | -------- | ----------------- | -------- | ----------- |
| generationId          | int       |          | AUTO_INCREMENT    | *        |             |
| familyId              | familyId  | *        |                   |          |             |
| generationName        | text      |          |                   |          |             |
| generationDescription | text      |          | ""                |          |             |
| generationParents     | plantId[] |          | []                |          |             |
| generationCreatedAt   | datetime  |          | CURRENT_TIMESTAMP | *        |             |
| generationModifiedAt  | datetime  |          | CURRENT_TIMESTAMP | *        |             |

## Genotype

|      Attribute      |     Type     | Required |      Default      | Internal | Description |
| ------------------- | ------------ | -------- | ----------------- | -------- | ----------- |
| genotypeId          | int          |          | AUTO_INCREMENT    | *        |             |
| generationId        | generationId | *        |                   |          |             |
| genotypeName        | text         |          |                   |          |             |
| genotypeDescription | text         |          | ""                |          |             |
| genotypeCreatedAt   | datetime     |          | CURRENT_TIMESTAMP | *        |             |
| genotypeModifiedAt  | datetime     |          | CURRENT_TIMESTAMP | *        |             |

## Plant

|        Attribute         |    Type    | Required |      Default      | Internal | Description |
| ------------------------ | ---------- | -------- | ----------------- | -------- | ----------- |
| plantId                  | int        |          | AUTO_INCREMENT    | *        |             |
| genotypeId               | genotypeId | *        |                   |          |             |
| mediumId (unimplemented) | mediumId   | *        |                   |          |             |
| plantName                | text       |          |                   |          |             |
| plantSex                 | text       |          | null              |          |             |
| plantClonedFrom          | plantId    |          | null              |          |             |
| plantDescription         | text       |          | ""                |          |             |
| plantCreatedAt           | datetime   |          | CURRENT_TIMESTAMP | *        |             |
| plantModifiedAt          | datetime   |          | CURRENT_TIMESTAMP | *        |             |

## PlantLog

|     Attribute      |   Type   | Required |      Default      | Internal | Description |
| ------------------ | -------- | -------- | ----------------- | -------- | ----------- |
| plantLogId         | int      |          | AUTO_INCREMENT    | *        |             |
| plantId            | plantId  | *        |                   |          |             |
| plantLogTimestamp  | datetime | *        |                   |          |             |
| plantLogType       | text     | *        |                   |          |             |
| plantLogValue      | blob     | *        |                   |          |             |
| plantLogCreatedAt  | datetime |          | CURRENT_TIMESTAMP | *        |             |
| plantLogModifiedAt | datetime |          | CURRENT_TIMESTAMP | *        |             |

## Medium (unimplemented)

|     Attribute     |     Type      | Required |      Default      | Internal | Description |
| ----------------- | ------------- | -------- | ----------------- | -------- | ----------- |
| mediumId          | int           |          | AUTO_INCREMENT    | *        |             |
| environmentId     | environmentId | *        |                   |          |             |
| mediumDescription | text          |          | ""                |          |             |
| mediumCreatedAt   | datetime      |          | CURRENT_TIMESTAMP | *        |             |
| mediumModifiedAt  | datetime      |          | CURRENT_TIMESTAMP | *        |             |
|                   |               |          |                   |          |             |


## MediumLog (unimplemented)
|      Attribute      |   Type   | Required |      Default      | Internal | Description |
| ------------------- | -------- | -------- | ----------------- | -------- | ----------- |
| mediumLogId         | int      |          | AUTO_INCREMENT    | *        |             |
| mediumId            | mediumId | *        |                   |          |             |
| mediumLogTimestamp  | datetime | *        |                   |          |             |
| mediumLogType       | text     | *        |                   |          |             |
| mediumLogValue      | blob     | *        |                   |          |             |
| mediumLogCreatedAt  | datetime |          | CURRENT_TIMESTAMP | *        |             |
| mediumLogModifiedAt | datetime |          | CURRENT_TIMESTAMP | *        |             |



## Environment (unimplemented)

|       Attribute       |   Type   | Required |      Default      | Internal | Description |
| --------------------- | -------- | -------- | ----------------- | -------- | ----------- |
| environmentId         | int      |          | AUTO_INCREMENT    | *        |             |
| environmentName       | text     | *        |                   |          |             |
| environmentCreatedAt  | datetime |          | CURRENT_TIMESTAMP | *        |             |
| environmentModifiedAt | datetime |          | CURRENT_TIMESTAMP | *        |             |

## EnvironmentLog (unimplemented)

|        Attribute         |     Type      | Required |      Default      | Internal | Description |
| ------------------------ | ------------- | -------- | ----------------- | -------- | ----------- |
| environemntLogId         | int           |          | AUTO_INCREMENT    | *        |             |
| environmentId            | environmentId | *        |                   |          |             |
| environmentLogTimestamp  | datetime      | *        |                   |          |             |
| environmentLogType       | text          | *        |                   |          |             |
| environmentLogValue      | blob          | *        |                   |          |             |
| environmentLogCreatedAt  | datetime      |          | CURRENT_TIMESTAMP | *        |             |
| environmentLogModifiedAt | datetime      |          | CURRENT_TIMESTAMP | *        |             |


ToDo
=====
* Implement files/pictures/media
* Add .on events
* Make it possible to create plants without need of generations/family?!
* Add resolveParents to find?!
* Add strain?!
* Don't always select id attributes
* Harden API against invalid user input
* Improve performance for sql by only joining tables if necessary
* Use CONSTANTS. and not hardcoded attribute/table names

Development Notes/Coding Style
==============================

* Always use explicit column names (explicit => including table name) in your queries as soon as you query to different tables. Why? Because for all foreign keys we use the same column name in source and destination table. SQLite can't know which table you mean, so we just use explicit column names for everything. Eg: `generations.familyId` references `families.familyId`.

* Try to use CONSTANTS wherever you can, especially for attributes. This makes it easier to change the attribute or variable names and reduces the risk of misspelling any constant.
