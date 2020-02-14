process.env.NODE_ENV = 'test';

const request = require('supertest');
const db = require('../db');
const app = require('../app');

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  const result = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple', 'Smart Phone King')
    RETURNING code, name, description`
  );
  
  testCompany = result.rows[0];
  testCompany.invoices = [];
  const { code, name } = testCompany;
  testCompanyAbbrev = {code, name};
  console.log("test company", testCompany);

});

afterAll(async function () {
  await db.end();
});

/** GET /companies - retunes  */

describe("GET /companies - Returns list of companies, like {companies: [{code, name}, ...]}", () => {
  // See if test works too
  it('gets a list of companies', async () => {
    const res = await request(app).get(`/companies`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompanyAbbrev] });
  });
});

/** GET / companies/[code] */

describe("GET /companies/[code] - Return obj of company: {company: {code, name, description}}", () => {
  it('gets company info', async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany });
  });
});

