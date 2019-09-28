#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright © 2019 Yongwen Zhuang <zyeoman@163.com>
#
# Distributed under terms of the MIT license.

"""
Model

"""

import datetime

from . import db


class User(db.Model):

    """Users"""

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'
