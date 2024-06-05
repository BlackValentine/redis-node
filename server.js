import express from 'express';
import axios from 'axios';
import cacheData from './cacheData.js'
import NewRedis from './redis.js';

const app = express();
const port = process.env.PORT || 3000;

const redisClient = NewRedis();

async function fetchApiData(species) {
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to the API");
  return apiResponse.data;
}

async function getSpeciesData(req, res) {
  const species = req.params.species;
  let results;

  try {
    results = await fetchApiData(species);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    await redisClient.set(species, JSON.stringify(results), {
      EX: 180,
      NX: true,
    });

    res.send({
      fromCache: false,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/fish/:species", cacheData, getSpeciesData);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})