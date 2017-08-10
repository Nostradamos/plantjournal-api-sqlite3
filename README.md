[![Build Status](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite.svg?branch=master)](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite)
[![dependencies Status](https://david-dm.org/Nostradamos/plantjournal/status.svg)](https://david-dm.org/Nostradamos/plantjournal) [![devDependencies Status](https://david-dm.org/Nostradamos/plantjournal-api-sqlite/dev-status.svg)](https://david-dm.org/Nostradamos/plantjournal?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/Nostradamos/plantjournal-api-sqlite/badge.svg?branch=master)](https://coveralls.io/github/Nostradamos/plantjournal-api-sqlite?branch=master)

plantjournal-api-sqlite
=======================

This repo contains a plantJournal API implementation using sqlite3 as the database engine.


ToDo
=====
* Improve applyWhere for generationParents, add generationParents.length and add tests
* Better errors, with code, computer error string, and human readable error message?!
* Add plantLog
* Add medium and mediumLog
* Add environment and environmentLog
* Implement files/pictures/media
* Add .on events
* Add resolveParents to find?!
* Harden API against invalid user input
* Add strain?!
* Don't always select id attributes
* Improve performance for sql by only joining tables if necessary

Development Notes/Coding Style
==============================

* Always use explicit column names (explicit => including table name) in your queries as soon as you query to different tables. Why? Because for all foreign keys we use the same column name in source and destination table. SQLite can't know which table you mean, so we just use explicit column names for everything. Eg: `generations.familyId` references `families.familyId`.

* Try to use CONSTANTS wherever you can, especially for attributes. This makes it easier to change the attribute or variable names and reduces the risk of misspelling any constant.
