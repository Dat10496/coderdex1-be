const fs = require("fs");
const csv = require("csvtojson");

const createData = async () => {
  let newData = await csv().fromFile("../data.csv");
  let data = JSON.parse(fs.readFileSync("../db.json"));
  newData = Array.from(newData);
  newData = newData.slice(0, 721);

  newData = newData.map((data, index) => {
    const type1 =
      data.Type1.toString().charAt(0).toLowerCase() + data.Type1.slice(1);

    if (data.Type2) {
      const type2 =
        data.Type2.toString().charAt(0).toLowerCase() + data.Type2.slice(1);
      return {
        id: `${index + 1}`,
        name: data.Name,
        types: [type1, type2],
        url: `http://localhost:5000/images/${index + 1}.jpg`,
      };
    } else {
      return {
        id: `${index + 1}`,
        name: data.Name,
        types: [type1],
        url: `http://localhost:5000/images/${index + 1}.jpg`,
      };
    }
  });
  data.totalPokemons = newData.length;

  data.data = newData;

  fs.writeFileSync("../db.json", JSON.stringify(data));
};

createData();
