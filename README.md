https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-shared.html

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
