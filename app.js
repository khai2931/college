/*
 * College Inclusiveness Search Team
 * February 2025
 */

"use strict";

const express = require("express");
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const multer = require("multer");

const USER_ERROR = 400;
const SERVER_ERROR = 500;



// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true})); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

/** EXAMPLE GET/POST requests belows, NOT for our use!! */

// get all yip data, or yip data matching a particular search
app.get('/yipper/yips', async function(req, res) {
  try {
    let search = req.query["search"];
    let query;
    let rows;
    if (search) {
      query = "SELECT id FROM yips WHERE yip LIKE ? ORDER BY id";
      rows = await runSQLQuery(db => db.all(query, "%" + search + "%"));
    } else {
      query = "SELECT id, name, yip, hashtag, likes, date FROM yips";
      query += " ORDER BY DATETIME(date) DESC";
      rows = await runSQLQuery(db => db.all(query));
    }
    res.json({
      "yips": rows
    });
  } catch (err) {
    res.status(SERVER_ERROR).type("text");
    res.send(SERVER_ERROR_MSG);
  }
});

// update likes of a yip
app.post('/yipper/likes', async function(req, res) {
  let id = req.body["id"];
  if (id) {
    try {
      let query = "SELECT likes FROM yips WHERE id = ?";
      let row = await runSQLQuery(db => db.get(query, String(id)));
      if (!row) {
        res.status(USER_ERROR).type("text");
        res.send(ID_NOT_EXIST_MSG);
      } else {
        let newLikes = row["likes"] + 1;
        query = "UPDATE yips SET likes = ? WHERE id = ?";
        await runSQLQuery(db => db.run(query, String(newLikes), String(id)));
        res.type("text");
        res.send(String(newLikes));
      }
    } catch (err) {
      res.status(SERVER_ERROR).type("text");
      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.status(USER_ERROR).type("text");
    res.send(MISSING_PARAM_MSG);
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
    filename: 'yipper.db',
    driver: sqlite3.Database
  });
  return db;
}

// serve the main page under public
app.use(express.static('public'));
const DEFAULT_PORT = 8000;
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);