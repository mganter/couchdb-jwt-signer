# JWT-Signer using CouchDB users database

This application uses the couchdb users database to sign JWTs.

The username will be provided as `sub` (subject), `exp` is the expiration time, `iat` is the time when the token was issued. 
Roles of a user will be provided as a string array `_couchdb.roles`, understandable by CouchDB using the `jwt_authentication_handler`.

The tokens signed with this app will be also valid for authentication purposes on the CouchDB with the users db. 

```json
{
  "sub": "user",
  "_couchdb.roles": [
    "test"
  ],
  "exp": 1593288783,
  "iat": 1593288183
}
```

## Usage

### Configuration of CouchDB

* \[chttpd] Add `{chttpd_auth, jwt_authentication_handler}` to `authentication_handlers`
* \[httpd] Add `{chttpd_auth, jwt_authentication_handler}` to `authentication_handlers`
* \[jwt_keys] Set key `allowed_algorithms` to value `HS256`
* \[jwt_keys] Set key `hmac:_default` to value base64 value of your secret env (eg. `myverycoolsecrettosigntokenswith` would be `bXl2ZXJ5Y29vbHNlY3JldHRvc2lnbnRva2Vuc3dpdGg=`)

### Configuration

| Name          | Description                                               | Default                          |
|:--------------|:----------------------------------------------------------|:---------------------------------|
| couchUserDB   | CouchDB _users database                                   | http://localhost:5984/_users     |
| secret        | CouchDB _users database                                   | myverycoolsecrettosigntokenswith |
| token_timeout | Timeout of the token in seconds (86400 is equal to 1 day) | 86400                            |
| token_path    | CouchDB _users database                                   | /auth/token                      | 

## Build

To build a container image. Just run `docker build .`.

## Deploy

To deploy to Kubernetes using helm adapt your value and execute `helm install couch-jwt-signer deploy/helm/ `.