import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "EV Charging Reservation System",
            version: "1.0.0",
            description: "API documentation for EV charging station reservation system",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
export const swaggerDocs = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);