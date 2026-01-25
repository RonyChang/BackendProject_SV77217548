require('dotenv').config();

const app = require('./app');
const { port } = require('./config');
const { sequelize } = require('./models');
const { startOrderExpiryJob } = require('./services/orderExpiry.service');

sequelize.authenticate()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor escuchando en puerto ${port}`);
        });
        startOrderExpiryJob();
    })
    .catch((error) => {
        console.error('Error al conectar con la base de datos:', error.message || error);
        process.exit(1);
    });
