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


def check(database, json_data):
    """Check if read url """
    ret = {"read": False}
    user = json_data.get('user', 'default')
    key = json_data.get('key', 'default')
    url = json_data.get('url', '')
    if url == '':
        ret['status'] = "ERR: Empty url!"
        return ret
    cursor = database.cursor()
    cursor.execute('SELECT * FROM user WHERE username=?', (user, ))
    res = cursor.fetchone()

    if res is None:
        ret['status'] = "New User"
        cursor.execute(
            'INSERT INTO user (username, key) values (?,?)', (user, key))
        user_id = cursor.lastrowid
        cursor.execute('''INSERT INTO readlist (reader_id,url)
            VALUES (?,?)''', (user_id, url))
    elif res['key'] != key:
        ret['status'] = "ERR: Wrong key"
    else:

        ret['status'] = "OK"
        user_id = res['id']
        # Search readlist
        cursor.execute(''' SELECT strftime("%Y-%m-%d %H:%M:%S", created) FROM readlist
                WHERE reader_id=? and url=?''', (user_id, url))
        all_rows = cursor.fetchall()
        # Insert readlist
        cursor.execute('''INSERT INTO readlist (reader_id,url)
            values (?,?)''', (user_id, url))
        if len(all_rows) > 0:
            key = all_rows[-1].keys()[0]
            ret['read'] = True
            ret['lastread'] = all_rows[-1][key]
            ret['count'] = len(all_rows)
        else:
            ret['read'] = False

    cursor.close()
    database.commit()
    return ret


class Haveread(Resource):
    def post(self):
        database = db.get_db()
        json_data = request.get_json(force=True)
        return check(database, json_data)


def init_app(app):
    app.config.update(RESTFUL_JSON=dict(ensure_ascii=False))
    api = Api(app)
    api.add_resource(Haveread, '/')
