const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/", function (req, res, next) {
  const allowedFilter = ["types", "name", "page", "limit"];

  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);
    const filterValue = Object.values(filterQuery);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const err = new Error(`Query ${key} is not allowed`);
        err.statusCode = 404;
        throw err;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    let offset = limit * (page - 1);

    let result = [];

    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

    const { data } = db;

    if (filterKeys.length && !filterKeys.includes("types")) {
      filterKeys.forEach((condition) => {
        result = result.length
          ? result.filter(
              (pokemon) => pokemon[condition] === filterQuery[condition]
            )
          : data.filter(
              (pokemon) => pokemon[condition] === filterQuery[condition]
            );
      });
    } else if (filterKeys.includes("types")) {
      filterValue.forEach((condition) => {
        result = result.length
          ? result.filter((pokemon) => pokemon.name === filterValue[1])
          : data.filter((pokemon) => pokemon["types"].includes(condition));
      });
    } else {
      result = data;
    }

    let count = result.length;
    let totalPokemons = db.totalPokemons;
    result = result.slice(offset, offset + limit);

    res
      .status(200)
      .send({ data: result, count: count, totalPokemons: totalPokemons });
  } catch (error) {
    next(error);
  }
});

router.get("/:pokemonId", (req, res, next) => {
  try {
    const { pokemonId } = req.params;

    if (pokemonId < 1 || pokemonId > 721) {
      const err = new Error("Pokemon not found");
      err.statusCode = 401;
      throw err;
    }

    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data } = db;
    let result;

    const targetIndex = data.findIndex((pokemon) => {
      return pokemon.id === pokemonId;
    });

    let indexPrevious = targetIndex - 1;
    let indexNext = targetIndex + 1;

    if (targetIndex === 0) {
      indexPrevious = 720;
    } else if (targetIndex === 720) {
      indexNext = 0;
    }

    result = {
      pokemon: data[targetIndex],
      previousPokemon: data[indexPrevious],
      nextPokemon: data[indexNext],
    };

    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  const pokemonTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flyingText",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
  ];
  try {
    let db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data } = db;

    const { name, url, types, id } = req.body;

    const typeKeys = Object.values(types);
    const nameKey = name.toString();

    // check if types is allowed & name is already
    const notAllowTypes = typeKeys.filter(
      (type) => !pokemonTypes.includes(type)
    );
    const notAllowName = data.filter((pokemon) => pokemon.name === nameKey);
    const notAllowId = data.filter((pokemon) => pokemon.id === id);

    if (!name || !types || !url || !id) {
      const err = new Error("Missing body type");
      err.statusCode = 401;
      throw err;
    } else if (notAllowTypes.length) {
      const err = new Error("Type is invalid");
      err.statusCode = 401;
      throw err;
    } else if (notAllowName.length) {
      const err = new Error("Name is already");
      err.statusCode = 401;
      throw err;
    } else if (notAllowId.length) {
      const err = new Error("Id is already");
      err.statusCode = 401;
      throw err;
    }
    // create new pokemon
    const newPokemon = {
      name,
      types,
      id,
      url,
    };

    // push and save newPokemon to db
    data.push(newPokemon);

    db.totalPokemons += 1;
    db.data = data;

    fs.writeFileSync("db.json", JSON.stringify(db));

    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

router.put("/:pokemonId", (req, res, next) => {
  const pokemonTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flyingText",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
  ];
  const allowUpdate = ["name", "types", "url"];

  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data } = db;
    const { pokemonId } = req.params;
    const { name, types } = req.body;
    const updates = req.body;

    const updateKeys = Object.keys(updates);
    const notAllow = updateKeys.filter((al) => !allowUpdate.includes(al));

    const typeKeys = Object.values(types);
    const nameKey = name.toString();

    // Check if types is allowed && name is already
    const notAllowTypes = typeKeys.filter(
      (type) => !pokemonTypes.includes(type)
    );
    const notAllowName = data.filter((pokemon) => pokemon.name === nameKey);

    if (notAllow.length) {
      const err = new Error("Update field not allow");
      err.statusCode = 401;
      throw err;
    } else if (notAllowTypes.length) {
      const err = new Error("Type is invalid");
      err.statusCode = 401;
      throw err;
    } else if (notAllowName.length) {
      const err = new Error("Name is already");
      err.statusCode = 401;
      throw err;
    }
    // find index of pokemon by id
    const targetIndex = data.findIndex((pokemon) => pokemon.id === pokemonId);

    if (targetIndex < 0) {
      const err = new Error("Pokemon not found");
      err.statusCode = 404;
      throw err;
    }

    // update pokemon field
    const updatePokemon = { ...db.data[targetIndex], ...updates };
    data[targetIndex] = updatePokemon;
    fs.writeFileSync("db.json", JSON.stringify(db));
    res.status(200).send(updatePokemon);
  } catch (error) {
    next(error);
  }
});

router.delete("/:pokemonId", (req, res, next) => {
  try {
    const { pokemonId } = req.params;

    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data } = db;

    const targetIndex = data.findIndex((pokemon) => pokemon.id === pokemonId);

    if (targetIndex < 0) {
      const err = new Error("Pokemon not found");
      err.statusCode = 401;
      throw err;
    }
    // delete pokemon
    db.data = data.filter((pokemon) => pokemon.id !== pokemonId);
    // save to data
    fs.writeFileSync("db.json", JSON.stringify(db));
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});
module.exports = router;
