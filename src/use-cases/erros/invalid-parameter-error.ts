export class InvalidParameterError extends Error {
  constructor() {
    super(`One or more query parameters are invalid.`);
  }
}