## new facebook app id and app secret:
The new Facebook app Id and app secret created by amir on Pru's Facebook account and technically, she is the owner of the app in the facebook.
the `old facebook app id:133088487346292`
the `old facebook app secret:7922d3fd803b524876e6ef6d16ad8cea`

# How to run the project localy:
you have to change these changes to these files:
1- Go to `/api/src/config/server.dev.json` and change:
* line 1:`host` from `"0.0.0.0"` to `"localhost"`
* line 8:`sqs endpoint` from `"http://sqs:4568/"` to `"http://localhost:4568/"`

2-Go to `/api/src/config/server.js` and change:
* line 26: at the end of the line 26 `let processedHost` from `"172.18.0.3"` to `"localhost"`

3- go to `/web/package.json` and change the `proxy` from `"https://api.humankind.codeyourfuture.io"` to `"http://localhost:3000/"`

### to run the backend from your terminal go to `api` folder and run : `NODE_PATH=src node index.js`
### to run the frontend from your terminal go to `web` folder and run : `npm start`

# if you like to run test you need to do these changes:
go to `api/test/DataHelper.js` and follow these steps:
* `uncommnet` line 6
* `comment` line `9-10-11` and add these after them:
```
const neo4jAuth = `http://${config.neo4j.user}:${config.neo4j.pass}@`;
const neo4jBatchEndpoint = `${config.neo4j.host.replace(
  "http://",
  neo4jAuth
)}/db/data/batch`;
const neo4jQueryEndpoint = `${config.neo4j.host.replace(
  "http://",
  neo4jAuth
)}/db/data/transaction/commit`;
```


