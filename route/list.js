var router = require('express').Router();

const MongoClient = require("mongodb").MongoClient;

var db;
MongoClient.connect(
  "mongodb+srv://admin:1111@cluster0.s7iwyel.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);

    db = client.db("TodoApp");
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

    // router.listen(8080, function () {
    //   console.log("listening on 8080 ");
    // });
  }
);



//list로 Get요청으로 접속하면 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
router.get("/list", function (req, res) {
    //몽고DB 리스트
    db.collection("post")
      .find()
      .toArray(function (err, results) {
        console.log(results);
        res.render("list2.ejs", { posts: results});
        //디비에 저장된 post라는 collection안의 id가 뭐인 데이터를 꺼내주세요.
      });
});

module.exports = router;