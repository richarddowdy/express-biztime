const express = require("express");
const db = require("../db");

const router = new express.Router();

router.get("/", async function(req, res){
  const result = await db.query(
    `SELECT code, name FROM companies`);

  return res.json({
    companies: result.rows
  });
});

router.get("/:code", async function(req, res, next) {
  const code = req.params.code;
  const result = await db.query(
    `SELECT code, name, description
     FROM companies 
     WHERE code = $1`, [code]
  );

  return res.json({
    company: result.rows[0]
  });
});

router.post("/", async function(req, res){

  const {code, name, description} = req.body

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
});

router.put("/:code", async function(req, res, next) {
  const code = req.params.code;
  //can put accept only one alteration
  const {name, description} = req.body;

  const result = await db.query(
    `UPDATE companies
     SET name=$2, description=$3
     WHERE code = $1
     RETURNING code, name, description`, [code, name, description]
  );

  return res.json({
    company: result.rows[0]
  });
});

router.delete("/:code", async function(req, res, next) {
  const code = req.params.code;
  
  const result = await db.query(
    `DELETE FROM companies
     WHERE code = $1`, [code]
  );

  return res.json({
    status: "deleted"
  });
});


module.exports = router;