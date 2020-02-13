const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError")
const router = new express.Router();


router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT code, name FROM companies`);

    if (result.rows.length === 0){
      throw new ExpressError("company table is empty", 500);
    }

    return res.json({
      companies: result.rows
    });
  }

  catch (err) {
    return next(err);
  }
});

router.get("/:code", async function (req, res, next) {
  const code = req.params.code;

  try {
    const result = await db.query(
      `SELECT code, name, description
       FROM companies 
       WHERE code = $1`, [code]
    );

    if (result.rows.length === 0){
      throw new ExpressError("Please input a valid company code", 400);
    }

    return res.json({
      company: result.rows[0]
    });
  }

  catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {

  const { code, name, description } = req.body

  try {
    if (!code || !name || !description || Object.keys(req.body).length !== 3){
      throw new ExpressError("Please input valid company information (Code, Name, Description)", 400);
    }
    const result = await db.query(
      `INSERT INTO companies
       (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
      [code, name, description]
    );


    return res.json({
      company: result.rows[0]
    });
  }
  catch (err) {
    return next(err);
  }
});

router.put("/:code", async function (req, res, next) {
  const code = req.params.code;
  //can put accept only one alteration
  const { name, description } = req.body;

  try {
    if (!name || !description || Object.keys(req.body).length !== 2){
      throw new ExpressError("Please input valid information for each field", 400);
    }
    
    const result = await db.query(
      `UPDATE companies
       SET name=$2, description=$3
       WHERE code = $1
       RETURNING code, name, description`, [code, name, description]
    );

    if (result.rows.length === 0){
      throw new ExpressError("Thats not a Company in this Database", 400);
    }

    return res.json({
      company: result.rows[0]
    });
  }

  catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;

  try {
    const result = await db.query(
      `SELECT code, name, description
       FROM companies 
       WHERE code = $1`, [code]
    );
    
    if (result.rows.length === 0){
      throw new ExpressError("Please input a valid company code", 400);
    }

    await db.query(
      `DELETE FROM companies
       WHERE code = $1`, [code]
    );

    return res.json({
      status: "deleted"
    });
  }

  catch (err) {
    return next(err);
  }
});


module.exports = router;