const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");

const { asyncHandler, handleValidationErrors } = require("../utils");
const { getUserToken, requireShelterAuth } = require("../auth");
const db = require("../db/models");

const router = express.Router();
router.use(requireShelterAuth);

const { ShelterUser } = db;

const validateEmailAndPassword = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
];
const validateLoginShelter = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check('username')
    .exists({ checkFalsy: true })
    .withMessage("Please provide a username. ")
    .isLength({ max: 32 })
    .withMessage("Username cannot be longer than 32 character."),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
  check('shelterName')
    .exists({ checkFalsy: true })
    .withMessage("Please provide a shelter name.")
    .isLength({ max: 128 })
    .withMessage("Name cannot be longer than 128 character."),
  check('phoneNum')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a phone number.')
    .isLength({ max: 10 })
    .withMessage('Please provide a valid phone number.'),
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Please provide an address'),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a city name.'),
  check('stateId')
    .exists({ checkFalsy: true })
    .withMessage('Please select a state.'),
  check('zipCode')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a zip code.')
    .isLength({ max: 5 })
    .withMessage('Please provide a valid zip code.')
];
//Create a new shelter

router.post('/',
  validateLoginShelter,
  validateEmailAndPassword,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, username, password, shelterName, phoneNum, address, city, stateId, zipCode } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await ShelterUser.create({ email, username, hashedPassword, shelterName, phoneNum, address, city, stateId, zipCode });

    const token = getUserToken(user);
    res.status(201).json({
      user: { id: user.id },
      token,
    });

  }));


router.post(
  "/token",
  validateEmailAndPassword,
  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const shelterUser = await ShelterUser.findOne({
      where: {
        email,
      },
    });

    if (!shelterUser || !shelterUser.validatePassword(password)) {
      const err = new Error("Login failed");
      err.status = 401;
      err.title = "Login failed";
      err.errors = ["The provided credentials were invalid."];
      return next(err);
    }
    const token = getUserToken(shelterUser);
    res.json({ token, user: { id: user.id } });
  })
);

//Shelter User not Found
const shelterUserNotFoundError = (id) => {
  const err = Error(`Shelter user with id of ${id} could not be found.`);
  err.title = "Shelter user not found.";
  err.status = 404;
  return err;
};

// Update a shelter User
router.put('/:id(\\d+)',
  validateEmailAndPassword,
  handleValidationErrors,
  asyncHandler(async (req, res, next) => {
    const shelterUserId = parseInt(req.params.id, 10);
    const updatedShelterUser = await ShelterUser.findByPk(shelterUserId);

    if (updatedShelterUser) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await updatedShelterUser.update(
        {
          email: req.body.email,
          username: req.body.username,
          password: hashedPassword,
          shelterName: req.body.shelterName,
          phoneNum: req.body.phoneNum,
          city: req.body.city,
          stateId: req.body.stateIdId,
          zipCode: req.body.zipCode
        }
      );
      res.json({ updatedShelterUser });
    } else {
      next(shelterUserNotFoundError(shelterUserId));
    }
  }));


//GET single shelter user
router.get(
  "/:id(\\d+)",
  requireShelterAuth,
  asyncHandler(async (req, res, next) => {
    const shelterUserId = parseInt(req.params.id, 10)
    const shelterUser = await ShelterUser.findByPk(shelterUserId, {
      attributes: { exclude: ["hashedPassword"] }
    });

    if (shelterUser) {
      res.json({ shelterUser });
    } else {
      next(shelterUserNotFoundError(shelterUserId));
    }

  })
);

// Delete a shelter user

router.delete(
  "/:id(\\d+)",
  asyncHandler(async (req, res, next) => {
    const shelterUserId = parseInt(req.params.id, 10);
    const shelterUser = await ShelterUser.findByPk(shelterUserId);

    if (shelterUser) {
      await shelterUser.destroy();
      res.status(204).end();
    } else {
      next(shelterUserNotFoundError(shelterUserId));
    }
  })
);
module.exports = router;