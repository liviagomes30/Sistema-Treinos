const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LiftNote API',
      version: '1.0.0',
      description: 'Documentação da API do LiftNote',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor Local (API v1)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Caminhos onde estarão as anotações JSDoc
  apis: ['./src/routes/*.js', './src/app.js'], // Incluindo app.js para a rota /health
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
