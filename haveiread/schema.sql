/*
 * schema.sql
 * Copyright (C) 2019 Yongwen Zhuang <zeoman@163.com>
 *
 * Distributed under terms of the MIT license.
 */


DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS readlist;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  key TEXT NOT NULL
);

CREATE TABLE readlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reader_id INTEGER NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (reader_id) REFERENCES user (id)
);

-- vim:et
