const express = require('express');
const session = require('express-session');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const app = express();

// 세션 설정
app.use(session({
  secret: 'your_secret_key', // 보안을 위해 환경변수로 관리
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// 사용자 데이터 저장 (예제용)
const users = [];

// 카카오 전략 설정
passport.use(new KakaoStrategy({
  clientID: 'c1c91dc58ac081c2694fc02937100e5b', // 카카오 REST API 키
  callbackURL: '/auth/kakao/callback'
}, (accessToken, refreshToken, profile, done) => {
  const authId = `kakao:${profile.id}`;
  let user = users.find(user => user.authId === authId);

  if (!user) {
    user = {
      authId: authId,
      displayName: profile.username || profile.displayName,
      email: profile._json?.kakao_account?.email || 'No email provided'
    };
    users.push(user);
  }

  return done(null, user);
}));

// 세션 직렬화 및 역직렬화
passport.serializeUser((user, done) => done(null, user.authId));
passport.deserializeUser((authId, done) => {
  const user = users.find(user => user.authId === authId);
  done(null, user || false);
});

// 라우트
app.get('/', (req, res) => {
  res.send(`
    <h1>로그인 예제</h1>
    <a href="/auth/kakao">카카오로 로그인</a>
  `);
});

app.get('/auth/kakao', passport.authenticate('kakao'));

app.get('/auth/kakao/callback', passport.authenticate('kakao', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`
    <h1>프로필</h1>
    <p>이름: ${req.user.displayName}</p>
    <p>이메일: ${req.user.email}</p>
    <a href="/logout">로그아웃</a>
  `);
});

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// 서버 실행
const PORT = 8081;
app.listen(PORT, () => console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`));
