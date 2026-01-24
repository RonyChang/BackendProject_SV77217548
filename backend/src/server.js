require('dotenv').config();

const app = require('./app');
const { port } = require('./config');
const { sequelize } = require('./models');

sequelize.authenticate()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor escuchando en puerto ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar con la base de datos:', error.message || error);
        process.exit(1);
    });
