const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/paper", (req, res) => {
  axios
    .get(
      `https://api.semanticscholar.org/graph/v1/paper/${process.env.PAPER_ID}/citations`
    )
    .then((response) => {
      axios
        .post(`https://api.semanticscholar.org/graph/v1/paper/batch`, {
          params: { fields: `paperId,title` },
          ids: response.data.data.map((i) => i.citingPaper.paperId),
        })
        .then((response) => {
          console.log(response.data);
        });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
