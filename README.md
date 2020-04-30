# HaveIRead
我看过这个页面么？

## API
`curl -X POST localhost:7890/<username>/ -d {password:key,url:url, title:title, len:len}`

`curl -X GET localhost:7890/<username>?url=https://baidu.com/`

```json
{
    "read": true,
    "lastread": "2019-06-27 16:24:28",
    "readtime": 180,
    "count": 3
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
(waitress-serve --port=7890 --call 'haveiread:create_app'&
```

## Deploy
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/zYeoman/haveiread/tree/master)

## TODO
* [x] Use raise error.
* [x] Flask Bcrypt
* [x] Track reading time
* [ ] 支持 TAG 系统
* [ ] 支持评论系统
* [ ] 优化 UI
* [ ] 管理页面
* [ ] Deploy to [heroku](https://www.heroku.com/)
* [ ] JS faster, more beautiful and more info.
* [ ] JS only track in foreground
* [ ] Info for all url in somepage: e.g. in github awesome-xxx repo / bilibili up spaces
