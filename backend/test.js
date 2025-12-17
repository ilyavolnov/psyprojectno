const { initDatabase } = require('./database'); 
     initDatabase().then(() => console.log('Done')).catch(err => console.error('Error:', 
     err));
