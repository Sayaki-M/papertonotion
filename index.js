const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
require("dotenv").config();
const { Client } = require("@notionhq/client");

notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/paper", (req, res) => {
  axios
    .get(
      `https://api.semanticscholar.org/graph/v1/paper/${process.env.PAPER_ID}/citations`,
      {
        params: {
          limit: 500,
          //fields:"isInfluential"
        },
      }
    )
    .then((response) => {
      axios
        .post(
          "https://api.semanticscholar.org/graph/v1/paper/batch?fields=url,title,authors,citationCount,fieldsOfStudy,tldr",
          {
            ids: response.data.data.map((i) => i.citingPaper.paperId),
          }
        )
        .then((response) => {
          response.data.forEach((paper) => {
            (async () => {
              const res = await notion.pages.create({
                parent: {
                  type: "database_id",
                  database_id: "af2b39d30bb049488affe02f692ad57b",
                },
                properties: {
                  title: {
                    title: [
                      {
                        text: {
                          content: paper.title,
                        },
                      },
                    ],
                  },
                  authors: {
                    multi_select: paper.authors.map((author) => ({
                      name: author.name,
                    })),
                  },
                  URL: {
                    url: paper.url,
                  },
                  citationCount: {
                    number: paper.citationCount,
                  },
                  tldr: paper.tldr
                    ? paper.tldr.text
                      ? {
                          rich_text: [
                            {
                              text: {
                                content: paper.tldr.text,
                              },
                            },
                          ],
                        }
                      : undefined
                    : undefined,
                  fieldsOfStudy: paper.fieldsOfStudy
                    ? {
                        multi_select: paper.fieldsOfStudy.map((field) => ({
                          name: field,
                        })),
                      }
                    : undefined,
                },
              });
            })();

            (async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            })();
          });
        });
    });
});

app.get("/sampleadd", (req, res) => {
  (async () => {
    const res = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: "af2b39d30bb049488affe02f692ad57b",
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: "ねこのせいたい",
              },
            },
          ],
        },
        authors: {
          multi_select: [{ name: "nekodanekoo", name: "inuyamainuko" }].map(
            (author) => ({
              name: author.name,
            })
          ),
        },
        URL: {
          url: "https://www.google.com",
        },
        citationCount: {
          number: 23,
        },
        tldr: undefined,
        //  {
        //   rich_text: [
        //     {
        //       text: {
        //         content: null,
        //         link: null,
        //       },
        //       //plain_text: "ねこのせいたいについてかいたものです",
        //     },
        //   ],
        // },
        fieldsOfStudy: {
          multi_select: ["せいぶつがく", "りゅうたいりきがく"].map((field) => ({
            name: field,
          })),
        },
      },
    });
  })();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
