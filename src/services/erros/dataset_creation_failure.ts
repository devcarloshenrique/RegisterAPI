export class DatasetCreationFailure extends Error {
  constructor() {
    super('Failed to create dataset.');
  }
}
