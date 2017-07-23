[![Build Status](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite.svg?branch=master)](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite)
[![dependencies Status](https://david-dm.org/Nostradamos/plantjournal/status.svg)](https://david-dm.org/Nostradamos/plantjournal) [![devDependencies Status](https://david-dm.org/Nostradamos/plantjournal-api-sqlite/dev-status.svg)](https://david-dm.org/Nostradamos/plantjournal?type=dev)

plantjournal-api-sqlite
=======================

This repo contains a plantJournal API implementation using sqlite3 as the database engine.


ToDo
=====

* Add etag field, basically hash over all attributes with md5. Easy for create,
  bit harder for update. Needs overhaul of those two functions. Do or don't?!
* Add like/contains... to setWhere
* Add .on events
* Add sorting for find, update, delete
* Add resolveParents to find?!
* Add plantJournal
* Add medium/environment
* Add mediumLog
* Add environmentData
* Implement files/pictures/media
* Add strain?!

Development Notes/Coding Style
==============================

* Always use explicit column names (explicit => including table name) in your queries as soon as you query to different tables. Why? Because for all foreign keys we use the same column name in source and destination table. SQLite can't know which table you mean, so we just use explicit column names for everything. Eg: `generations.familyId` references `families.familyId`.

* Try to use CONSTANTS wherever you can, especially for attributes. This makes it easier to change the attribute or variable names and reduces the risk of misspelling any constant.
