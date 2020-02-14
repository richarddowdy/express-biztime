const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError")
const router = new express.Router();


router.get("/", async function (req, res) { 

    const result = await db.query(
      `SELECT code, name FROM companies`);

    return res.json({
      companies: result.rows
    });

});


router.get("/:code", async function (req, res, next) {
  const code = req.params.code;

  try {
    const compResp = await db.query(
      `SELECT code, name, description
       FROM companies 
       WHERE code = $1`, [code]
    );

    const invoicesResp = await db.query(
      `SELECT id, amt, paid, add_date, paid_date
       FROM invoices
       WHERE comp_code = $1`, [code]
    );
    
    if (compResp.rows.length === 0) {
      throw new ExpressError("Please input a valid company code", 400);
    }

    const company = compResp.rows[0];
    const invoices = invoicesResp.rows;
    const result = { ...company, invoices }

    return res.json({
      company: result
    });
  }

  catch (err) {
    return next(err);
  }
});


router.post("/", async function (req, res, next) {

  const { code, name, description } = req.body

  try {

    let validKeys = ["code", "name", "description"];
    for(let key in req.body){
      if(validKeys.indexOf(key) === -1){
        throw new ExpressError("Not all input keys are valid.", 400);
      }
    }

    if (!code || !name) {
      throw new ExpressError("Please input company code and name.", 400);
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

    let validKeys = ["name", "description"];
    for(let key in req.body){
      if(validKeys.indexOf(key) === -1){
        throw new ExpressError("Not all input keys are valid.", 400);
      }
    }

    if (!name) {
      throw new ExpressError("Please input valid name for company.", 400);
    }

    const result = await db.query(
      `UPDATE companies
       SET name=$2, description=$3
       WHERE code = $1
       RETURNING code, name, description`, [code, name, description]
    );

    if (result.rows.length === 0) {
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
      `DELETE FROM companies
      WHERE code = $1
      RETURNING $1`, [code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Please input a valid company code", 400);
    }

    return res.json({
      status: "deleted"
    });
  }

  catch (err) {
    return next(err);
  }
});


module.exports = router;