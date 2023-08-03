# INSTALL

1. `git clone ... ~/qqur`
2. `npm i`
3. env file 작성

```
db=
token=
private_key=
algorithm=
workers_token=
account_id=
menus_namespace_id=
users_namespace_id=
```

3. `npm run build`

4. service 파일 작성

```
[Unit]
Description=qqur
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/qqur
ExecStart=/usr/bin/node build
Restart=on-failure

[Install]
WantedBy=multi-user.target

```

5. nginx 설치 및 설정해서 포트 포워딩 하시오

## (optional) AWS DynamoDB 용

https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-shared.html

## MEMORY 부족으로 KILLED 될때

https://plainenglish.io/blog/how-to-execute-nuxt-npm-run-build-on-low-spec-server-ef7442b5c03d

# API

# MENU

## GET /api/v1/menus?key=mid

메뉴의 데이터를 불러옵니다.

- Response 200 : body

## PUT /api/v1/menus?key=mid

메뉴를 생성 또는 수정합니다.

- Request
  - Bearer
  - Body : {}
- Response : null

# USERS

## GET /api/v1/users?key=email

이메일의 유저가 있는지 확인합니다.

- Response : null

## GET /api/v1/users?key=email&pw=password

로그인하고 atoken, rtoken을 발급 받습니다.

- Response : atoken, rtoken

## PUT /api/v1/users?key=email

회원가입하고 atoken, rtoken을 발급 받습니다.

- Request body: { password }
- Response : atoken, rtoken
