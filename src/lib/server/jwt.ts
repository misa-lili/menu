import crypto from 'crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
// atoken

// rtoken

/**
 * atoken과 rtoken 둘다 서버에 저장될 필요 없다. 별개로 보면된다.
 * atoken이 만료되지 않았으면, 부여된 권한에 접근 가능하다.
 * atoken이 만료됐으면 rtoken을 요구한다.
 * rtoken이 만료되지 않았으면 atoken을 재발급해준다.
 * rtoken이 만료되었으면 비밀번호를 입력하고 로그인을 요구한다.
 * 그럼 rtoken을 재발급해준다. rtoken은 잘 사용 안하게 남겨둔다.
 * Authorization Bearer 에 싣어서 보낸다. atoken rtoken 둘다.
 *
 * 아 그리고 서버가 재시작하면 모든 기존 토큰들은 만료된다. << key를 새로 발급
 * 연결된 mid 변경시, atoken 만료된다.
 *
 * payload
 * sub: "a" or "r"
 * mids: ["","","",...] <- atoken only
 * iat: 발급시간
 * exp: 자동 만료 시간
 *
 */

const jwtSecret = crypto.randomBytes(24);

export const signToken = ({ sub, mids }: { sub: 'a' | 'r'; mids?: string[] }): string => {
	return jwt.sign(
		{
			sub,
			mids
		},
		jwtSecret,
		{ expiresIn: sub === 'a' ? '1h' : '1d' }
	);
};

const verifyToken = (token: string): string | JwtPayload | void => {
	try {
		const decodedToken = jwt.verify(token, jwtSecret);
		return decodedToken;
	} catch (err) {
		console.log(err);
	}
};
