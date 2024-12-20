// MySQL + nodejs 접속 코드
// var mysql = require("mysql");
// var conn = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "123456",
//   database: "nodejs",
// });

// conn.connect();

// conn.query("select * from todo", function (err, rows, fields) {
//   if (err) throw err;

//   console.log(rows);
// });

ObjectId = require('mongodb').ObjectId;
const express = require("express");
const app = express();

//socket.io
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http);

require('dotenv').config();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.use("/public", express.static("public"));
//app.use(express.static("/views/images/"));
//패스포트
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;

//세션
const session = require('express-session');
app.use(session({
  secret : '1111',
  resave : false,
  saveUninitialized:true
}));

//패스포트 미들웨어 설정
app.use(passport.initialize());
app.use(passport.session());

// var md5 = require("md5");
var sha256 = require('sha256');

// var passport = require('passport');
// var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var db;
MongoClient.connect(
  process.env.DB_URL,
  function (err, client) {
    if (err) return console.log(err);

    db = client.db("TodoApp");
    app.db = db;
    // db.collection('post').insertOne({이름 : '이창현', _id : 100}, function(err, result){
    //     console.log('저장완료');
    // });

    // app.post('/add', function(req, res){
    //     res.send('전송 완료');
    //     console.log(req.body.title);
    //     console.log(req.body.date);
    //     const title = req.body.title;
    //     const date = req.body.date;

    //     db = client.db('Todoapp');
    //     db.collection('post').insertOne({제목 : title, 날짜 : date}, function(err, result){
    //         console.log('저장완료');
    //     });
    // })

    http.listen(process.env.PORT, function () {
      console.log("listening on 8080 ");
    });
  }
);

var imageurl = '';

app.use('/', require('./route/shop.js'))
app.use('/', require('./route/list.js'))

// app.get("/", function (req, res) {
//   //   res.sendFile(__dirname + "/index.html");
//   res.render("index.ejs");
// });

// app.get("/write", function (req, res) {
//   //   res.sendFile(__dirname + "/write.html");
//   res.render("write.ejs");
// });

//list로 Get요청으로 접속하면 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
// app.get("/list", function (req, res) {
//   //몽고DB 리스트
//   db.collection("post")
//     .find()
//     .toArray(function (err, results) {
//       console.log(results);
//       res.render("list.ejs", { posts: results });
//       //디비에 저장된 post라는 collection안의 id가 뭐인 데이터를 꺼내주세요.
//     });

  //MySQL 리스트
  // conn.query("select * from todo", function (err, rows, fields) {
  //   if (err) throw err;

  //   console.log(rows);
  //   res.render("list.ejs", { posts: rows });
  // });
// });


app.get("/detail/:id", function (req, res) {
  req.params.id = new ObjectId(req.params.id);
  db.collection("post").findOne(
    { _id: req.params.id },
    function (err, result) {
      console.log('test');
      console.log(result);
      res.render("detail.ejs", { data: result });
    }
  );
});

app.get("/edit/:id", function (req, res) {
  req.params.id = new ObjectId(req.params.id);
  db.collection("post").findOne(
    { _id: req.params.id },
    function (err, result) {
      console.log(result);
      res.render("edit.ejs", { post: result });
    }
  );
});

app.post("/edit", function (req, res) {
//app.put("/edit", function (req, res) {
  //폼에 담긴 제목데이터, 날짜데이터를 가지고
  //db.colloection에다가 업데이트함.
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { todo: req.body.title, content : req.body.content, date: req.body.date } },
    function (err, result) {
      console.log("수정완료");
      res.redirect("/list");
    }
  );
});

// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const session = require("express-session");

//세션 스토어
var FileStore = require('session-file-store')(session)

app.use(session({
  store : new FileStore(),
  secret : 'aaaaa',
  resave: false,
  saveUninitialized: true
}));

// app.use(
//   session({ secret: "비밀코드", resave: true, saveUninitialized: false })
// );
// app.use(passport.initialize());
// app.use(passport.session());

app.get("/login", function (req, res) {
  console.log('로그인');
  res.render("login.ejs");
});

// app.post(
//   "/login",
//   passport.authenticate("local", {
//     failureRedirect: "/fail",
//   }),
//   function (req, res) {
//     res.redirect("/");
//   }
// );
//패스포트를 이용한 인증 방식
app.post("/login", passport.authenticate('local', {
      failureRedirect : '/fail'
    }),(req, res) => {
    myname = '';
    res.redirect('/');
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (inputId, inputPw, done) {
      // console.log(inputId, inputPw);
      db.collection("login").findOne({ id: inputId }, function (err, result) {
        if (err) return done(err);
        if (!result)
          return done(null, false, { message: "존재하지 않는 아이디입니다." });
        if (inputPw == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "비번 틀렸어요." });
        }
      });
    }
  )
);

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       if (!user.verifyPassword(password)) { return done(null, false); }
//       return done(null, user);
//     });
//   }
// ));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (usrid, done) {
  db.collection("login").findOne({ id: usrid }, function (err, result) {
    done(null, result);
    console.log(result);
  });
});

app.get("/mypage", islogin, function (req, res) {
  console.log(req.user);
  res.render("mypage.ejs", { user: req.user });
});

app.get("/signup", function (req, res) {
  res.render("signup.ejs");
});

function islogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인 해주세요.");
  }
}

app.post("/signup", function (req, res) {
  console.log(req.body);

  db.collection("login").insertOne(
    {
      id: req.body.id,
      pw: req.body.pw,
      address: req.body.address,
      mobile: req.body.mobile,
    },
    function (err, result) {
      console.log("저장완료");
    }
  );

  res.redirect("/login");
});

const cookieParser = require("cookie-parser");
const { Socket } = require("dgram");
app.use(cookieParser());

app.get("/count", function (req, res) {
  if (req.cookies.count) {
    var count = parseInt(req.cookies.count);
  } else {
    count = 0;
  }
  count = count + 1;
  res.cookie("count", count);
  res.send("count : " + count);
});

// var products = {
//   1: { title: "컵라면" },
//   2: { title: "초코파이" },
// };

// app.get("/products", function (req, res) {
//   var output = "";
//   for (var name in products) {
//     output += `<li>
//       <a href='/cart/${name}'>${products[name].title}</a>
//     </li>`;
//   }
//   res.send(`<ul>${output}</ul><a href='/cart'>Cart</a>`);
// });

// app.get("/cart/:id", function (req, res) {
//   var id = req.params.id;

//   if (req.cookies.cart) {
//     var cart = req.cookies.cart;
//   } else {
//     var cart = {};
//   }
//   if (!cart[id]) {
//     cart[id] = 0;
//   }

//   cart[id] = parseInt(cart[id]) + 1;
//   res.cookie("cart", cart);
//   res.redirect('/cart');
// });

//세션 미들웨어
// app.use(
//   session({
//     secret: "123456",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

app.get("/sscnt", function (req, res) {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send("count : " + req.session.count);
});

app.get("/tmp", function (req, res) {
  res.send("result : " + req.session.displayname);
});

// var salt = 'dfdkjf';
//세션 로그인 처리
// app.post("/login", function (req, res) {
//   var userid = req.body.id;
//   var userpw = req.body.pw;

//   db.collection("login").findOne({ id: userid }, function (err, result) {
//     if (err) return done(err);
//     if (!result) res.send("존재하지 않는 아이디입니다.");
//     console.log(md5(userpw));
//     console.log(result.pw);
//     if (md5(userpw + result.salt) == md5(result.pw + result.salt)) {
//       // res.send("로그인 되었습니다.");
//       req.session.displayname = userid;
//       res.redirect("/");
//     } else {
//       res.send("비번이 틀렸습니다.");
//     }
//   });
// });

app.get("/logout", function (req, res) {
  console.log(req.session.displayname);
  delete req.session.displayname;
  res.redirect("/");
});

//sha256
// var users = [
// {
//   username : 'lch',
//   password : 'ff966b1eff052fd37622d1442e6612c02c06621268c19c3d55af000128465866',
//   salt : '1111'
// },
// {
//   username : 'lch',
//   password : 'ff966b1eff052fd37622d1442e6612c02c06621268c19c3d55af000128465866',
//   salt : '1111'
// }
// ]

app.post("/login", function (req, res) {
  var userid = req.body.id;
  var userpw = req.body.pw;

  db.collection("login").findOne({ id: userid }, function (err, result) {
    if (err) return done(err);
    if (!result) res.send("존재하지 않는 아이디입니다.");
    console.log(userpw);
    console.log(result.pw);
    if (sha256(users.password + users.salt) == sha256(userpw + users.salt)) {
      // res.send("로그인 되었습니다.");
      req.session.displayname = userid;
      return req.session.save(function(){
        res.redirect("/");
      })
      
    } else {
      res.send("비번이 틀렸습니다.");
    }
  });
});



passport.use(new FacebookStrategy({
  clientID: '1571149343308013',
  clientSecret: '4e5c8f5ed6d6b083b4833a263d34e9f8',
  callbackURL: "/facebook/callback",
  profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  var authId = 'facebook:'+profile.id;
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(user.authId === authId){
      return done(null, user);
    }
  }
  var newuser = {
    'authId':authId,
    'displayName':profile.displayName,
    'email':profile.emails[0].value
  };
  users.push(newuser);
  done(null, newuser);
}
));






// app.get('facebook', passport.authenticate('facebook'));
// app.get('facebook/callback', passport.authenticate(
//   'facebook',
//   {
//     successRedirect:'/',
//     failureRedirect:'/login'
//   }
// ));


// 사용자 데이터 저장 (예제용)
const users = [];

// 카카오 전략 설정
passport.use(new KakaoStrategy({
  clientID: 'c1c91dc58ac081c2694fc02937100e5b', // 카카오 REST API 키
  callbackURL: '/auth/kakao/callback' // 리다이렉트 URL
}, (accessToken, refreshToken, profile, done) => {
  console.log(profile);
  const authId = `kakao:${profile.id}`;
  let user = users.find(user => user.authId === authId);

  if (!user) {
    user = {
      authId: authId,
      displayName: profile.username || profile.displayName,
      email: profile._json?.kakao_account?.email
    };
    users.push(user);
  }

  return done(null, user);
}));


passport.serializeUser(function(user, done){
  console.log('serializerUser', user);
  myname = user.displayName;
  done(null, user.authId);
})

passport.deserializeUser(function(id, done){
  console.log('deserializerUser', id);
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(user.authId === id){
      return done(null, user);
    }
  }
  done('There is no user')
});



app.get('/auth/kakao', passport.authenticate('kakao'));

app.get('/auth/kakao/callback', passport.authenticate('kakao', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`
    <h1>프로게이머</h1>
    <p>이름: ${req.user.displayName}</p>
    <p>이메일: ${req.user.email}</p>
    <a href="/logout">로그아웃</a>
  `);
});


app.get(
  '/facebook',
  passport.authenticate(
    'facebook',
    {scope:'email'}
  )
);
app.get(
  '/facebook/callback',
  passport.authenticate(
    'facebook',
    {
      successRedirect: '/',
      failureRedirect: '/login'
    }
  )
);

//삭제
app.post("/delete", function (req, res) {
  //console.log(req.body);
  //console.log(req.user);
 //req.body._id = parseInt(req.body._id);

  // console.log(req.user);
  if(req.user === undefined){
    console.log("삭제오류");
    // return res.status(500).render('login.ejs');
    return res.redirect("/login");
  }
  else{
    var deleteData = {_id : ObjectId(req.body._id), writer : ObjectId(req.user._id)}
    console.log(deleteData);
    db.collection("post").deleteOne(deleteData, function (err, result) {
      if (err) return console.log(err);
      console.log("삭제 완료");
      res.status(200).send({ message: "성공했습니다." });
    });
  }
  console.log("end");
});




app.get('/socket', function(req, res){
  res.render('socket.ejs');
})

io.on('connection', function(socket){
  console.log('유저접속됨');

  socket.on('room1-send', function(data){
    io.to('room1').emit('broadcast', data);
  });

  socket.on('joinroom', function(data){
    socket.join('room1');
  });

  socket.on('user-send', function(data){
    console.log(data);
     io.emit('broadcast', data);
    //io.to(socket.id).emit('broadcast', data);
  });
})

var myname = '';
app.get("/", function (req, res) {
  console.log('루트');
  //res.send('<img src = "/me.jpg">');
  console.log(req.user);
  console.log(myname);

  if(myname == ''){
    res.render('index.ejs', {url : imageurl, name : "바보"});
  }else{
    res.render('index.ejs', {url : imageurl, name : myname});
  }
 
  //res.sendFile(__dirname + "/views/index.html");
});


//multer 설정
let multer = require('multer');

let storage = multer.diskStorage({
  destination : function(req, res, cb){
    cb(null, './public/image')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname)
  }
});

let upload = multer({storage : storage});

app.get('/upload', function(req, res){
  res.render('upload.ejs');
});

app.post('/upload', upload.single('picture'), function(req, res){
  // res.send('업로드 완료');
  // console.log(res.file[path]);
  // res.send(res);
      // db.collection("images").insertOne({name : name, filePath :filePath},function(err,doc){
      //   //디비에 저장
      //   console.log('업로드 완료');
      // });
  console.log(req.file.path);
  imageurl = '\\' + req.file.path;
  //res.render('write.ejs', {urls : imageurl});
})

app.get('/image/:imgname', function(req, res){
  res.sendFile(__dirname + '/public/image/' + req.params.imgname);
})

app.post("/add", function (req, res) {
  // res.send("전송 완료");
  console.log(req.body);

  db.collection("counter").findOne(
    { name: "postcnt" },
    function (err, results) {
      console.log(results.totalPost);

      var totalCount = results.totalPost;

      console.log(req.user);
      if(req.user == undefined)
      {
          res.redirect('/login');
      }

      db.collection("post").insertOne(
        {  writer : req.user._id, todo: req.body.title, content: req.body.content, date: req.body.someDate, path: imageurl},
        function (err, result) {
          console.log("저장완료");
          imageurl = '';
          //counter라는 콜렉션에 있는 totalPost 라는 항목도 1 증가 시켜야함;
          db.collection("counter").updateOne(
            { name: "postcnt" },
            { $inc: { totalPost: 1 } },
            function (err, results) {
              if (err) {
                return console.log(err);
              }
            }
          );
          //res.redirect("/list");
        }
      );
    }
  );
  res.redirect("/");
});

app.get("/search", (req, res) => {
  console.log(req.query.value);
  //일반적인 순차검색
  // db.collection('post').find({todo : req.query.value}).toArray((err, result)=>{
  //   console.log(result);
  //   res.render('search.ejs', {posts : result});
  // })

  //바이너리 검색
  db.collection('post').find({$text : {$search : req.query.value}}).toArray((err, result)=>{
    console.log(result);
    res.render('search.ejs', {posts : result});
  })
});



