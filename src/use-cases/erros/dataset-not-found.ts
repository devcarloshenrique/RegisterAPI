export class DatasetNotFound extends Error {
  constructor() {
    super('The dataset with the specified ID was not found.');
  }
}