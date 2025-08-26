export const authenticateDoc = {
  "/auth/login": {
    post: {
      summary: "User authenticate.",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Authenticated successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 200 },
                  message: { type: "string", example: "Authenticated successfully." },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string", example: "Bearer <token>" },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid", example: "41121963-3bd8-4560-bdbc-3b1e2a917876" },
                          email: { type: "string", format: "email", example: "teste@gmail.com" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 400 },
                  message: { type: "string", example: "Validation error." }
                }
              }
            }
          }
        },
        401: {
          description: "Invalid credentials.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 401 },
                  message: { type: "string", example: "Invalid credentials." }
                }
              }
            }
          }
        },
      },
    },
  },
}
