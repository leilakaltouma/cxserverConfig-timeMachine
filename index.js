import fs from "fs";
import YAML from "js-yaml";
import { Octokit } from "@octokit/core";
import { TransformLanguages } from "./config/transform.js";
import dotenv from "dotenv"
dotenv.config()

async function loadYAML(URL) {
  try {
    const response = await fetch(URL);
    const data = await response.text();
    return YAML.load(data);
  } catch (error) {
    console.error(error);
  }
}

async function fetchCommitData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}


//get all git commits from cxserver

const octokit = new Octokit({
  auth: process.env.SECRET_TOKEN,
});

const commitList = await getAllCommits();

async function getAllCommits() {
  const response1 = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: "wikimedia",
    repo: "mediawiki-services-cxserver",
    path: "config",
    per_page: 100,
    page: 1,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const response2 = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: "wikimedia",
    repo: "mediawiki-services-cxserver",
    path: "config",
    per_page: 100,
    page: 2,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const commits1 = response1.data;
  const commits2 = response2.data;

  const allCommits = [...commits1, ...commits2];

  return allCommits;
}

const blockList = [
  "config/MWPageLoader.yaml",
  "config/languages.yaml",
  "config/JsonDict.yaml",
  "config/Dictd.yaml",
  "config/mt-defaults.wikimedia.yaml",
];

const commits = [];
const results = [];

async function main() {
  try {
    for (const commit of commitList) {
      const data = await fetchCommitData(commit.url);
      if (data.files) {
        data.files.forEach((file) => {
          if (
            file.filename.endsWith(".yaml") &&
            file.filename.startsWith("config/") &&
            !blockList.includes(file.filename)
          ) {
            commits.push({
              fileUrl: file.raw_url,
              date: commit.commit.author.date,
              filename: file.filename.split("/")[1],
            });
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }

  try {
    for (const commit of commits) {
      let doc = await loadYAML(commit.fileUrl);

      if (doc["handler"] === "transform.js" || doc["handler"] === "Yandex.js") {
        const langs = new TransformLanguages(doc);
        doc = langs.languages;
      }
      
      //loop through the target languages values
      for (const [sourceLanguage, targetLanguages] of Object.entries(doc)) {
        targetLanguages.forEach((targetLanguage) => {
          results.push({
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            engineName: commit.filename,
            timestamp: commit.date,
          });
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
  fs.writeFileSync("./output/language_pairs.json", JSON.stringify(results), (err) =>
    err ? console.log(err) : null
  );
}

main();