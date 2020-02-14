const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const router = new express.Router();


router.get("/", async function (req, res) { 
    const result = await db.query(`SELECT id, comp_code FROM invoices`);
    return res.json({ invoices: result.rows });
});


router.get("/:id", async function (req, res, next) {

  const id = req.params.id;

  try {
    const invoicesResp = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code
       FROM invoices
       WHERE id = $1`, [id]
    );

    if (invoicesResp.rows.length === 0) {
      throw new ExpressError("That invoice does not exist.", 404);
    }

    const { amt, paid, addDate, paidDate, compCode } = invoicesResp.rows[0];

    const compResp = await db.query(
        `SELECT code, name, description
        FROM companies
        WHERE code = $1`, [compCode]
    );

    const company = compResp.rows[0];
    const result = { id, amt, paid, addDate, paidDate, company };

    return res.json({ invoice: result });
  }

  catch (err) {
    return next(err);
  }
});


router.post("/", async function (req, res, next) {

  const { compCode, amt } = req.body;

  console.log("REQ BODY", req.body);
  console.log("COMP CODE", compCode);

  try {

    let validKeys = ["compCode", "amt"];
    for (let key in req.body){
      if(!validKeys.includes(key)){
        throw new ExpressError("Not all input keys are valid.", 400);
      }
    }

    if (!compCode || !amt || +amt < 0) {
      throw new ExpressError("Please input values for invoice comp_code and amt.", 400);
    }

    const result = await db.query(
      `INSERT INTO invoices
       (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [compCode, amt]
    );


    return res.json({ company: result.rows[0] });
  }

  catch (err) {
    return next(err);
  }
});

router.put("/:id", async function (req, res, next) {
  const id = req.params.id;
  const { amt } = req.body;

  try {

    if (!amt || amt < 0) {
      throw new ExpressError("Please input valid updated amount for invoice.", 400);
    }

    const result = await db.query(
      `UPDATE invoices
       SET amt=$2
       WHERE id = $1
       RETURNING id, comp_code, amt, paid, add_date, paid_date`, [id, amt]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("That invoice does not exist.", 404);
    }

    return res.json({ company: result.rows[0] });
  }

  catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;

  try {

    const result = await db.query(
      `DELETE FROM invoices
      WHERE id = $1
      RETURNING $1`, [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("That invoice does not exist.", 404);
    }

    return res.json({ status: "deleted" });
  }

  catch (err) {
    return next(err);
  }
});


module.exports = router;