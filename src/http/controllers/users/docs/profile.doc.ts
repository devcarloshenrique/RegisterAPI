export const profileDoc = {
  "/me": {
    get: {
      summary: "Get user profile.",
      description: "Retrieves authenticated user's profile. Requires valid JWT Bearer Token.",
      tags: ["Users"],
      security: [{
        bearerAuth: []
      }],
      responses: {
        200: {
          description: "User profile retrieved successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 200 },
                  message: { type: "string", example: "User profile retrieved successfully." },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid", example: "41121963-3bd8-4560-bdbc-3b1e2a917876" },
                          name: { type: "string", example: "user example" },
                          email: { type: "string", format: "email", example: "user@example.com" },
                          createdAt: { type: "string", format: "date-time", example: "2025-01-01T00:00:00Z" },
                        },
                      },
                    },
                  },
                }
              }
            }
          }
        },
        401: {
          description: "Invalid or missing token.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 401 },
                  message: { type: "string", example: "Invalid or missing token." }
                }
              }
            }
          }
        },
      }
    }
  }
}