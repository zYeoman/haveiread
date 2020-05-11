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
from flask_restful import Resource, Api, abort
from flask_bcrypt import Bcrypt
from . import db

bcrypt = Bcrypt()


def checkUser(cursor, user, key):
    """
    Check User: if user exists check key; else create new user
    """
    cursor.execute(
        'SELECT id, password_hash FROM user WHERE username=?', (user, ))
    res = cursor.fetchone()
    pw_hash = bcrypt.generate_password_hash(key)

    if res is None:
        cursor.execute(
            'INSERT INTO user (username, password_hash) values (?,?)',
            (user, pw_hash))
        return cursor.lastrowid
    elif bcrypt.check_password_hash(res['password_hash'], key):
        return res['id']
    else:
        cursor.close()
        abort(401, message="ERR: Wrong key")


class Haveread(Resource):
    def get(self, username='default'):
        database = db.get_db()
        params = request.args
        if params.get('url') is None:
            abort(400, message="Empty body")
        cursor = database.cursor()
        cursor.execute(
            '''SELECT strftime("%Y-%m-%d %H:%M:%S", lastread),
            readtime, readcount FROM readlist
            INNER JOIN user ON user.id=readlist.user_id
            INNER JOIN url ON url.id=readlist.url_id
            WHERE user.username=? and url.url=?''',
            (username, params['url']))
        all_rows = cursor.fetchall()
        cursor.close()
        if len(all_rows) > 0:
            row = all_rows[0]
            return {'read': True,
                    'lastread': row[0],
                    'readtime': row['readtime'],
                    'count': row['readcount']}
        else:
            return {'read': False}

    def post(self, username='default'):
        database = db.get_db()
        json_data = request.get_json(force=True)
        password = json_data.get('password', '')
        url = json_data.get('url', '')
        title = json_data.get('title', '')
        readtime = json_data.get('len', 0)
        if url == '':
            abort(400, message="Empty url!")
        cursor = database.cursor()
        user_id = checkUser(cursor, username, password)
        cursor.execute(
            '''SELECT readtime, readcount FROM readlist
            INNER JOIN url ON url.id=readlist.url_id
            WHERE user_id=? and url.url=?''',
            (user_id, url))
        row = cursor.fetchall()
        if len(row) == 0:
            cursor.execute('''INSERT INTO url (url, title) values (?, ?)''',
                           (url, title))
            url_id = cursor.lastrowid
            cursor.execute(
                '''INSERT INTO readlist
                (user_id, url_id, readtime, readcount)
                values (?,?,?,?)''', (user_id, url_id, readtime, 1))
        else:
            cursor.execute(
                '''UPDATE readlist SET readtime=?,readcount=? ''',
                (row[0]['readtime']+readtime//1000, row[0]['readcount']+1))
        cursor.close()
        database.commit()
        return {'status': 'OK'}


class Comment(Resource):
    def post(self, username='default'):
        database = db.get_db()
        json_data = request.get_json(force=True)
        key = json_data.get('password', 'default')
        url = json_data.get('url', '')
        title = json_data.get('title', '')
        comment = json_data.get('comment', '')
        if url == '' or comment == '':
            abort(400, message="Empty body")
        cursor = database.cursor()
        user_id = checkUser(cursor, username, key)
        cursor.execute('''SELECT url_id FROM url WHERE url=?''', (url,))
        rows = cursor.fetchall()
        url_id = 0
        if len(rows) == 0:
            cursor.execute('''INSERT INTO url (url, title) values (?, ?)''',
                           (url, title))
            url_id = cursor.lastrowid
        else:
            url_id = rows[0]['url_id']
        cursor.execute('''INSERT INTO comments (user_id, url_id, comm)
                values (?,?,?)''', (user_id, url_id, comment))
        cursor.close()
        database.commit()
        return {'status': 'OK'}


def init_app(app):
    app.config.update(RESTFUL_JSON=dict(ensure_ascii=False))
    bcrypt.init_app(app)
    api = Api(app)
    api.add_resource(Haveread, '/read/<string:username>')
    api.add_resource(Comment, '/comment/<string:username>')
