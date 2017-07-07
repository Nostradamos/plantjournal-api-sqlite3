[![Build Status](https://travis-ci.org/Nostradamos/PlantJournal.svg?branch=master)](https://travis-ci.org/Nostradamos/PlantJournal)
[![dependencies Status](https://david-dm.org/Nostradamos/plantjournal/status.svg)](https://david-dm.org/Nostradamos/plantjournal) [![devDependencies Status](https://david-dm.org/Nostradamos/plantjournal/dev-status.svg)](https://david-dm.org/Nostradamos/plantjournal?type=dev)

plantjournal-api-sqlite
=======================

This repo contains a plantJournal API using sqlite3 as the database engine.


ToDo
=====

* Refactor comments. Add them where they are missing.
* Refactor generic-find?!
* Refactor constants/variable names
* Add like/contains... to setWhere
* Add .on events
* Add sorting for find, update, delete
* Add resolveParents to find?!
* Add description fields
* Introduce eslint
* Add plantJournal
* Add medium/environment
* Add mediumLog
* Add environmentData
* Implement files/pictures/media
* Add strain?!

Development Notes/Coding Style
==============================

* Always use explicit column names (explicit => including table name) in your queries. Why? Because for all foreign keys we use the same column name in source and destination table. SQLite can't know which table you mean, so we just use explicit column names for everything. Eg: `generations.familyId` references `families.familyId`.
