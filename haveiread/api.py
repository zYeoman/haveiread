#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright © 2019 Yongwen Zhuang <zeoman@163.com>
#
# Distributed under terms of the MIT license.

"""
HaveIRead Server

Only support POST

"""

from flask import request, jsonify
from flask_restful import Resource, Api
from . import db


def checkUser(cursor, user, key):
    """
    Check User: if user exists check key; else create new user
    """
    ret = {"read": False, "status": "OK"}
    cursor.execute('SELECT * FROM user WHERE username=?', (user, ))
    res = cursor.fetchone()

    if res is None:
        ret["status"] = "New User"
        cursor.execute(
            'INSERT INTO user (username, key) values (?,?)', (user, key))
        ret["id"] = cursor.lastrowid
    elif res['key'] != key:
        ret["status"] = "ERR: Wrong key"
    else:
        ret['id'] = res['id']
    return ret


class Haveread(Resource):
    def post(self):
        database = db.get_db()
        json_data = request.get_json(force=True)
        return self.check(database, json_data)

    def check(self, database, json_data):
        """Check if read url """
        user = json_data.get('user', 'default')
        key = json_data.get('key', 'default')
        url = json_data.get('url', '')
        title = json_data.get('comment', '看过')
        if url == '':
            return {"read": False, "status": "ERR: Empty url!"}
        cursor = database.cursor()
        ret = checkUser(cursor, user, key)
        if ret["status"] == "ERR: Wrong key":
            return ret
        else:
            user_id = ret['id']
            # Search readlist
            cursor.execute('''SELECT strftime("%Y-%m-%d %H:%M:%S", created) FROM readlist
                    WHERE reader_id=? and url=?''', (user_id, url))
            all_rows = cursor.fetchall()
            # Insert readlist
            if len(all_rows) > 0:
                key = all_rows[-1].keys()[0]
                ret['read'] = True
                ret['lastread'] = all_rows[-1][key]
                ret['count'] = len(all_rows)
            else:
                ret['read'] = False
            cursor.execute('''INSERT INTO readlist (reader_id,url,title)
                values (?,?,?)''', (user_id, url, title))
            cursor.execute('''SELECT comm FROM comments
                    WHERE reader_id=? and url=?''', (user_id, url))
            all_rows = cursor.fetchall()
            if len(all_rows) > 0:
                ret['comment'] = all_rows[0]['comm']
            else:
                ret['comment'] = ""

        cursor.close()
        database.commit()
        return ret


class Comment(Resource):
    def put(self):
        database = db.get_db()
        json_data = request.get_json(force=True)
        user = json_data.get('user', 'default')
        key = json_data.get('key', 'default')
        url = json_data.get('url', '')
        comment = json_data.get('comment', '')
        if url == '':
            return {"status": "ERR: Empty url!"}
        if comment == '':
            return {"status": "ERR: Empty comment!"}
        cursor = database.cursor()
        ret = checkUser(cursor, user, key)
        if ret["status"] == "ERR: Wrong key":
            return {"status": "ERR: Wrong key!"}
        else:
            user_id = ret['id']
            cursor.execute('''INSERT or REPLACE INTO comments (reader_id, url, comm)
                    values (?,?,?)''', (user_id, url, comment))
        cursor.close()
        database.commit()
        return ret


def init_app(app):
    app.config.update(RESTFUL_JSON=dict(ensure_ascii=False))
    api = Api(app)
    api.add_resource(Haveread, '/read/')
    api.add_resource(Comment, '/comment/')
