export const registerDoc = {
  "/auth/register": {
    post: {
      summary: "Register new user.",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string"
                },
                email: {
                  type: "string",
                  format: "email"
                },
                password: {
                  type: "string"
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "User registered successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 201 },
                  message: { type: "string", example: "User registered successfully." }
                }
              }
            }
          }
        },
        400: {
          description: "Validation error.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 400 },
                  message: { type: "string", example: "Validation error." },
                  issues: {
                    type: "object",
                    properties: {
                      _errors: {
                        type: "array",
                        items: { type: "string" },
                        example: []
                      },
                      email: {
                        type: "object",
                        properties: {
                          _errors: {
                            type: "array",
                            items: { type: "string" },
                            example: ["Invalid email address"]
                          }
                        }
                      },
                      password: {
                        type: "object",
                        properties: {
                          _errors: {
                            type: "array",
                            items: { type: "string" },
                            example: ["String must contain at least 6 character(s)"]
                          }
                        }
                      }
                    },
                    example: {
                      _errors: [],
                      email: {
                        _errors: ["Invalid email address"]
                      },
                      password: {
                        _errors: ["String must contain at least 6 character(s)"]
                      }
                    }
                  }
                }
              }
            }
          }
        },
        409: {
          description: "E-mail already exists.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "integer", example: 409 },
                  message: { type: "string", example: "E-mail already exists." }
                }
              }
            }
          }
        },
      },
    },
  },
};