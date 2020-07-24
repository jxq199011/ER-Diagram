const express = require("express");
const router = express.Router();
// Load User model
const User = require("../models/User");
var theId;

const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

/* For ER diagram evaluation */
router.post("/dashboard", ensureAuthenticated, (req, res) => {
  var text = req.body;
  // store graph record
  User.findByIdAndUpdate(
    { _id: theId },
    {
      $push: {
        history: {
          $each: [text],
          $position: 0,
        },
      },
    },

    { new: true, upsert: true },
    (err, ret) => {
      if (err) {
        console.log(err);
      } else {
        res.json(text);
      }
    }
  );
});

// clean up all history
router.get("/cleanAll", ensureAuthenticated, (req, res) => {
  var text = req.body;
  // store graph record
  User.findByIdAndUpdate(
    { _id: theId },
    {
      $set: { history: [] },
    },

    { new: true, upsert: true },
    (err, ret) => {
      if (err) {
        console.log(err);
      } else {
        res.json(text);
      }
    }
  );
});

router.get("/history", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: theId }, (err, ret) => {
    if (err) {
      console.log(err);
    } else {
      res.json(ret.history[0]);
    }
  });
});

router.get("/history2", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: theId }, (err, ret) => {
    if (err) {
      console.log(err);
    } else {
      res.json(ret.history[1]);
    }
  });
});

router.get("/history3", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: theId }, (err, ret) => {
    if (err) {
      console.log(err);
    } else {
      res.json(ret.history[2]);
    }
  });
});
router.get("/history4", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: theId }, (err, ret) => {
    if (err) {
      console.log(err);
    } else {
      res.json(ret.history[3]);
    }
  });
});
router.get("/history5", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: theId }, (err, ret) => {
    if (err) {
      console.log(err);
    } else {
      res.json(ret.history[4]);
    }
  });
});

// Dashboard page
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  theId = req.user._id;

  res.render("dashboard", {
    user: req.user,
  });
});

//about Page
router.get("/about", ensureAuthenticated, (req, res) => {
  res.render("about", {
    user: req.user,
  });
});

// Tutorial page
router.get("/tutorial", ensureAuthenticated, (req, res) => {
  res.render("tutorial", {
    user: req.user,
  });
});

// login page tutorial
router.get("/ER-tutorial", forwardAuthenticated, (req, res) => {
  res.render("er-tutorial");
});

// for solution page
router.get("/solution1", ensureAuthenticated, (req, res) => {
  res.render("solution_1");
});
router.get("/solution2", ensureAuthenticated, (req, res) => {
  res.render("solution_2");
});
router.get("/solution3", ensureAuthenticated, (req, res) => {
  res.render("solution_3");
});
router.get("/solution4", ensureAuthenticated, (req, res) => {
  res.render("solution_4");
});
router.get("/solution5", ensureAuthenticated, (req, res) => {
  res.render("solution_5");
});
router.get("/solution6", ensureAuthenticated, (req, res) => {
  res.render("solution_6");
});
router.get("/solution7", ensureAuthenticated, (req, res) => {
  res.render("solution_7");
});
router.get("/solution8", ensureAuthenticated, (req, res) => {
  res.render("solution_8");
});
router.get("/solution9", ensureAuthenticated, (req, res) => {
  res.render("solution_9");
});
router.get("/solution10", ensureAuthenticated, (req, res) => {
  res.render("solution_10");
});
router.get("/solution11", ensureAuthenticated, (req, res) => {
  res.render("solution_11");
});
router.get("/solution12", ensureAuthenticated, (req, res) => {
  res.render("solution_12");
});
router.get("/solution13", ensureAuthenticated, (req, res) => {
  res.render("solution_13");
});
router.get("/solution14", ensureAuthenticated, (req, res) => {
  res.render("solution_14");
});
router.get("/solution15", ensureAuthenticated, (req, res) => {
  res.render("solution_15");
});

module.exports = router;

/* For ER diagram evaluation */
// router.post("/dashboard", ensureAuthenticated, (req, res) => {
//   var text = req.body;

//   // store graph record
//   User.findByIdAndUpdate({ _id: theId }, { history: text })
//     .then(() => {
//       console.log("cool");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   res.json(text);
// });

// /* For ER diagram evaluation */
// router.post("/dashboard", ensureAuthenticated, (req, res) => {
//   var text = req.body;
//   // store graph record
//   User.findByIdAndUpdate({ _id: theId }, { history: text }, (err, ret) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.json(text);
//     }
//   });
// });

// router.get("/history", ensureAuthenticated, (req, res) => {
//   User.findOne({ _id: theId }, (err, ret) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.json(ret.history);
//     }
//   });
// });
