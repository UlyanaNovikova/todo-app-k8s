if (process.env.PGHOST) {
    module.exports = require('./postgres'); // экспортирует postgres.js
} else {
    module.exports = require('./sqlite'); // 
}
