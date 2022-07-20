var express = require("express");
var router = express.Router();
const pokemonRouter = require("./pokemon.api");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to pokemon");
});

router.use("/pokemons", pokemonRouter);

module.exports = router;
