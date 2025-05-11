const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_mysql_password', // 👈 Replace with your actual MySQL password
  database: 'rice_tennis_forms'
});

module.exports = pool;
