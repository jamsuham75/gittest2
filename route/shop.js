var router = require('express').Router();

// router.get("/", function (req, res) {
//     //   res.sendFile(__dirname + "/index.html");
//     res.render("index.ejs");
//   });
  
router.get("/write", function (req, res) {
    //   res.sendFile(__dirname + "/write.html");
    res.render("write.ejs");
  });
  

module.exports = router;