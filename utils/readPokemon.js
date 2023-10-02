const path = require("path");
const fs = require("fs");

async function readPokemon() {
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), "db.json");
  console.log(jsonDirectory);
  await fs.readFile(jsonDirectory, "utf-8", async (error, data) => {
    console.log(typeof data);
    return data;
  });
}

module.exports = readPokemon;
