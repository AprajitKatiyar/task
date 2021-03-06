const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/database');


router.post('/register', (req, res) => {
    let newAdmin = new Admin({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password,
        job_profile: req.body.job_profile
    });
    Admin.addAdmin(newAdmin, (err, user) => {
        if (err) {
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists.";
            return res.json({
                success: false,
                message
            });
        } else {
            return res.json({
                success: true,
                message: "Admin registration is successful."
            });
        }
    });
});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) throw err;
        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found."
            });
        }

        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({
                    type: "admin",
                    data: {
                        _id: admin._id,
                        username: admin.username,
                        name: admin.name,
                        email: admin.email,
                        contact: admin.contact,
                        job_profile: admin.job_profile
                    }
                }, config.secret, {
                    expiresIn: 604800
                });
                return res.json({
                    success: true,
                    token: "JWT " + token
                });
            } else {
                return res.json({
                    success: true,
                    message: "Wrong Password."
                });
            }
        });
    });
});
router.post('/delete-admin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Admin.getAdminByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                    Admin.remove({ _id: user._id }, function(err) {
                      if (err) throw err;
                      else {
                          return res.json({
                              success: true,
                              message: "successfully Removed account."
                          });
                      }
                    });
            } else {
                return res.json({
                    success: true,
                    message: "Wrong Password."
                });
            }
        });
    });
});
router.post('/update-admin-pwd', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const newPassword=req.body.newPassword;
  Admin.getAdminByUsername(username, (err, user) => {
      if (err) throw err;
      if (!user) {
          return res.json({
              success: false,
              message: "Admin not found."
          });
      }

      Admin.comparePassword(password, admin.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
                bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPassword, salt, (err, hash) => {
                    if (err) throw err;
                    newAdminPassword = hash;
                    Admin.updateOne({ password: newAdminPassword },function(err,result) {
                      if (err) {
                        res.send(err);
                      } else {
                          return res.json({
                              success: true,
                              message: "Successfully Changed Password."
                          });
                      }
                    });
                });
            });
          } else {
              return res.json({
                  success: true,
                  message: "Wrong Password."
              });
          }
      });
  });


});

/**
 * Get Authenticated user profile
 */

router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    // console.log(req.user);
    return res.json(
        req.user
    );
});

module.exports = router;
