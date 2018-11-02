const { Client } = require('pg');

// instantiate client using your DB configurations
const client = new Client({
  database: 'd4jn3afp6e2c5a',
  user: 'luwvybzmbvcxeh',
  password: '001d367258389655c2d076592a8d66c719b9220e8b21b560df2ec502212b0e52',
  host: 'ec2-54-225-115-234.compute-1.amazonaws.com',
  port: 5432,
  ssl: true
});

client.connect().then(function () {
  console.log('connected to database')
}).catch(function (err) {
  if (err) {}
  console.log('cannot connect to database!')
})


module.exports = {
  query: (text, callback) => {
    return client.query(text, callback)
  }
}
