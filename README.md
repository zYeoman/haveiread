# HaveIRead
我看过这个页面么？

## API
POST localhost:5000/ {user:user,key:key,url:url}

```json
{
  "read":true,
  "status":"ok|wrongkey|newuser",
  "lastread":"time",
  "count":"count",
}
```

## Server
```bash
# init database
FLASK_APP=haveiread flask init-db
FLASK_APP=haveiread flask run
```

## Production
http://flask.pocoo.org/docs/1.0/tutorial/deploy/

Edit `instance/config.py` and add
```python
SECRET_KEY = b'something'
```

```bash
pip install waitress
waitress-serve --call 'flaskr:create_app --port=PORT'
```

## TODO
* Deploy to [heroku](https://www.heroku.com/)
* js faster, more beautiful and more info.
* use raise error.
* use peewee to contral sql.
