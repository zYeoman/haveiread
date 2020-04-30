/*
 * schema.sql
 * Copyright (C) 2019 Yongwen Zhuang <zyeoman@163.com>
 *
 * Distributed under terms of the MIT license.
 */

DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS url;
DROP TABLE IF EXISTS readlist;
DROP TABLE IF EXISTS comments;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(128) NOT NULL
);

CREATE TABLE url (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url VARCHAR(180) UNIQUE NOT NULL,
  title VARCHAR(180) NOT NULL
);

CREATE TABLE readlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  url_id INTEGER NOT NULL,
  lastread TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  readtime INTEGER NOT NULL,
  readcount INTEGER NOT NULL,
  UNIQUE(user_id, url_id),
  FOREIGN KEY (user_id) REFERENCES user (id)
  FOREIGN KEY (url_id) REFERENCES url (id)
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  url_id INTEGER NOT NULL,
  comm TEXT NOT NULL,
  createat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user (id)
  FOREIGN KEY (url_id) REFERENCES url (id)
);

CREATE TRIGGER [UpdateLastTime]
    AFTER UPDATE
    ON readlist
    FOR EACH ROW
    WHEN NEW.lastread < OLD.lastread    --- this avoid infinite loop
BEGIN
    UPDATE readlist SET lastread=CURRENT_TIMESTAMP WHERE id=OLD.id;
END;


-- vim:et
