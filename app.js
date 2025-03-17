/*
 * College Inclusiveness Search Team
 * February 2025
 *
 * This file provides the routes for college and review information,
 * such as average ratings in colleges, getting/adding college reviews,
 * and general information about colleges.
 */

"use strict";

const express = require("express");
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const multer = require("multer");

const SERVER_ERROR = 500;

const SERVER_ERROR_MSG = "Uh oh! Something went wrong on the server."



// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true})); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

//Returns an array of all college information, ordered alphabetically by name
app.get('/colleges', async function(req, res) {
  try {
    let query = "SELECT * FROM Colleges ORDER BY name";
    let rows = await runSQLQuery(db => db.all(query));
    res.json(rows);
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    res.send(SERVER_ERROR_MSG + ": " + err);
  }
});


//Returns all information about one college
app.get('/colleges/:name', async function(req, res) {
  try {
    let name = req.params["name"];
    let query = "SELECT * FROM Colleges WHERE name = ?";
    let row = await runSQLQuery(db => db.get(query, name));
    res.json(row);
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    res.send(SERVER_ERROR_MSG + ": " + err);
  }
});

//Finds all colleges that match or are similar to the search
app.get('/search/:search', async function(req, res) {
  try {
    let search = req.params["search"];
    let query = "SELECT name FROM Colleges ORDER BY name";
    let rows = await runSQLQuery(db => db.all(query));
    let collegeNames = [];
    for (let i = 0; i < rows.length; i++) {
      if (areSimilar(search, rows[i]["name"])) {
        collegeNames.push(rows[i]["name"]);
      }
    }
    res.json(collegeNames);
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    res.send(SERVER_ERROR_MSG + ": " + err);
  }
});

//Returns all survey responses for a University
app.get('/all-reviews/:college', async function(req, res) {
  try {
    let college = req.params["college"];
    let query = "SELECT * FROM Reviews WHERE college_name = ?";

    let rows = await runSQLQuery(db => db.all(query, college));

    if (rows && rows.length > 0){
      res.json(rows) //match found
    } else{
      res.json(null) //no average
    }
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    res.send(SERVER_ERROR_MSG + ": " + err);
  }
});

//Returns all the averaged ratings from Reviews table for a given university
app.get('/rating-avgs/:college', async function(req, res) {
  try {
    let college = req.params["college"];
    let query = "SELECT AVG(lgbtq_safety)         AS lgbtq_avg,"
              + " AVG(accommodations_difficulty)  AS difficulty_avg,"
              + " AVG(reliability_rating)         AS reliability_avg,"
              + " AVG(accommodation_rating)       AS rating_avg,"
              + " AVG(outside_rating)             AS outside_avg,"
              + " AVG(inside_accessibility)       AS inside_avg,"
              + " AVG(liberal_rating)             AS liberal_avg,"
              + " AVG(diversity_rating)           AS diversity_avg,"
              + " AVG(tolerance_rating)           AS tolerance_avg,"
              + " AVG(supportive_rating)          AS supportive_avg,"
              + " AVG(clubs_rating)               AS clubs_avg,"
              + " AVG(overallAccess_rating)       AS overallAccess_avg,"
              + " AVG(overallIdentity_rating)     AS overallIdentity_avg"
              + " FROM Reviews WHERE college_name = ?";
    let rows = await runSQLQuery(db => db.get(query, college));
    res.json(rows) //match found
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    res.send(SERVER_ERROR_MSG + ": " + err);
  }
});

//Return Y/N stats for a given college
app.get('/stats/:college', async function(req, res){
  try{
    let college = req.params["college"];
    let query = "SELECT AVG(exclusionary = 'Yes')*100  AS exclusionary_score,"
              +" AVG(friendly = 'Yes')*100 AS friendly_score,"
              +" AVG(lgbtq_id = 'Yes')*100  AS lgbtq_score,"
              +" AVG(mobility = 'Yes')*100  AS mobility_score"
              +" FROM Reviews WHERE college_name = ?";
    let rows = await runSQLQuery(db => db.get(query,college));
    res.json(rows);
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    res.send(SERVER_ERROR_MSG + ": " + err);
  }


});

//Adds a survey response to the Reviews table
app.post('/submit-survey/:college', async function(req, res){
  try{
    console.log("Recieved survey data: ", req.body);
    let {
      college_name,
      identities_list = "",
      race = "",
      disability_identity = "",
      gender = "",
      sexual_orientation = "",
      optin = "",
      lgbtq_id = "",
      lgbtq_safety = null, // Default to NULL for numbers
      exclusionary = "",
      friendly = "",
      accommodations_difficulty = null,
      reliability_rating = null,
      timeliness = "",
      accommodation_rating = null,
      mobility = "",
      outside_rating = null,
      inside_accessibility = null,
      liberal_rating = null,
      diversity_rating = null,
      tolerance_rating = null,
      supportive_rating = null,
      clubs_rating = null,
      overallAccess_rating = null,
      overallIdentity_rating = null,
      general_review = "",
      identity_review = ""} = req.body;


    let query ="INSERT INTO Reviews"
              +"(college_name,"
              +" identities_list, race,"
              +" disability_identity, gender,"
              +" sexual_orientation, optin,"
              +" lgbtq_id, lgbtq_safety,"
              +" exclusionary, friendly,"
              +" accommodations_difficulty, reliability_rating,"
              +" timeliness, accommodation_rating,"
              +" mobility, outside_rating,"
              +" inside_accessibility, liberal_rating,"
              +" diversity_rating, tolerance_rating,"
              +" supportive_rating, clubs_rating,"
              +" overallAccess_rating, overallIdentity_rating,"
              +" general_review, identity_review)"
              +"VALUES (?, ?, ?,"
                      +"?, ?, ?, ?,"
                      +"?, ?, ?, ?,"
                      +"?, ?, ?, ?,"
                      +"?, ?, ?, ?,"
                      +"?, ?, ?, ?,"
                      +"?, ?, ?, ?)";
      await runSQLQuery(db => db.run(query, [
        college_name,
        identities_list, race,
        disability_identity, gender,
        sexual_orientation, optin,
        lgbtq_id, lgbtq_safety,
        exclusionary, friendly,
        accommodations_difficulty, reliability_rating,
        timeliness, accommodation_rating,
        mobility, outside_rating,
        inside_accessibility, liberal_rating,
        diversity_rating, tolerance_rating,
        supportive_rating, clubs_rating,
        overallAccess_rating, overallIdentity_rating,
        general_review, identity_review]));
    res.type("text");
    res.send("Survey submitted successfully");
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    console.error("Database insert error:", err);
    res.send(SERVER_ERROR_MSG + ": " + err);
  }
});


/*   OTHER HELPERS   */

/**
 * Runs a SQL query based on passed-in function dbFunc
 * @param {function} dbFunc - function to call on db, must have param db
 * @returns {object} result of calling dbFunc(db);
 * @throws error if error is caught
 */
async function runSQLQuery(dbFunc) {
  try {
    let db = await getDBConnection();
    let res = await dbFunc(db);
    await db.close();
    return res;
  } catch (err) {
    throw err;
  }
}

/*   SOME HELPER FUNCTIONS   */

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'colleges.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * AI-generated helper function
 * Calculates similarity between two strings using exact and fuzzy matching
 * @param {string} str1 - First string to compare
 * @param {string} str2 - Second string to compare
 * @param {number} [threshold=0.8] - Similarity threshold (0 to 1) for fuzzy matching
 * @returns {boolean} - True if strings are similar, false otherwise
 */
function areSimilar(str1, str2, threshold = 0.4) {
  // Handle null, undefined, or empty inputs
  if (!str1 || !str2) {
    return str1 === str2;
  }

  // First try exact match (case-insensitive)
  if (str1.toLowerCase() === str2.toLowerCase()) {
    return true;
  }

  // Then check if each string exists in the other
  if (str1.toLowerCase().includes(str2.toLowerCase()) ||
    str2.toLowerCase().includes(str1.toLowerCase())) {
    return true;
  }


  // If not exact match, try fuzzy matching
  return getFuzzySimilarity(str1, str2) >= threshold;
}

/**
 * AI-generated helper function
 * Calculates fuzzy similarity score between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score between 0 and 1
 */
function getFuzzySimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);

  // Convert distance to similarity score
  const maxLength = Math.max(s1.length, s2.length);
  const similarity = 1 - (distance / maxLength);

  return similarity;
}

/**
 * AI-generated helper function
 * Calculates the Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - The minimum number of single-character edits needed
 */
function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill(null)
      .map(() => Array(str1.length + 1).fill(null));

  // Fill first row and column
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  // Fill rest of the matrix
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// serve the main page under public
app.use(express.static('public'));
const DEFAULT_PORT = 8000;
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);