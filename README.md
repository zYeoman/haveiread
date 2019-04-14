# HaveIRead
我看过这个页面么？

## API
POST localhost:5000/ {user:user,key:key,url:url}

```json
{
  "read":true|false,
  "status":"ok"|"wrongkey"|"newuser",
  "lastread":time,
  "count":count,
}
```

## Server
```bash
# init database
FLASK_APP=haveiread flask init-db
FLASK_APP=haveiread flask run
```
