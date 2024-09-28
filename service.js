const { Op } = require("sequelize");

/**
 * Author - Mangesh Balkawade : 7378336345
 * Service class that manages HTTP request handling for CRUD operations.
 */

/**
 * @class Service
 * @description Handles business logic for data operations, utilizing the repository layer for database interactions.
 * This class provides methods for fetching records, checking existence, counting records, and retrieving model keys.
 * It abstracts the complexities of direct database access and promotes a clean architecture.
 * 
 * @property {object} repository - Repository instance responsible for database operations.
 * @property {string} primaryKey - The name of the primary key field for the data model.
 * @property {boolean} softDeleteDefaultValue - Default value for considering soft deletion in queries.
 * 
 * @example
 * const service = new Service(userRepository);
 * const paginatedData = await service.getDataWithPaginationAndCondition(1, 10, ['name', 'email']);
 * const exists = await service.dataExists({ id: 1 });
 */

class Service {

  #repository = null;
  #primaryKey = null;
  #softDeleteDefaultValue = false;

  /**
   * @constructor
   * @param {object} repository - The repository instance to be used for database operations.
   */
  constructor(repository) {
    this.#repository = repository;
    this.#primaryKey = repository.getPrimaryKeyField();
    this.#softDeleteDefaultValue = repository.getSoftDeleteOption();
  }

  /**
   * Saves new data into the database.
   * @param {object} data - The data to be saved.
   * @param {Transaction|null} [transaction=null] - Optional transaction to be used for the save operation.
   * @returns {Promise<object>} - The saved data.
   * @example
   * const newData = await service.saveData({ name: 'John', age: 30 });
   */
  saveData = async (data, transaction = null) =>
    await this.#repository.saveData(data, transaction);

  /**
   * Saves multiple records into the database in bulk.
   * @param {Array<object>} data - The array of data objects to be saved in bulk.
   * @param {Transaction|null} [transaction=null] - Optional transaction to be used for the bulk save operation.
   * @returns {Promise<Array<object>>} - The saved data records.
   * @example
   * const bulkData = await service.saveBulkData([{ name: 'John' }, { name: 'Jane' }]);
   */
  saveBulkData = async (data, transaction = null) =>
    await this.#repository.saveBulkData(data, transaction);

  /**
   * Updates existing data in the database by ID.
   * @param {number|string} id - The ID of the record to update.
   * @param {object} data - The new data to update in the record.
   * @param {Transaction|null} [transaction=null] - Optional transaction for the update operation.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to include soft-delete condition during the update.
   * @returns {Promise<object>} - The updated data.
   * @example
   * const updatedData = await service.updateDataById(1, { name: 'John Doe' });
   */
  updateDataById = async (id, data, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.updateDataById(id, data, transaction, softDeleteOption);

  /**
   * Updates data in the database based on a condition.
   * @param {object} condition - The condition to match the records. Use an empty object to update all records.
   * @param {object} data - The new data to update in the matched records.
   * @param {Transaction|null} [transaction=null] - Optional transaction for the update operation.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to include soft-delete condition during the update.
   * @returns {Promise<number>} - The number of affected rows.
   * @example
   * const affectedRows = await service.updateDataWithCondition({ status: 'active' }, { status: 'inactive' });
   */
  updateDataWithCondition = async (condition = {}, data = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.updateDataWithCondition(condition, data, transaction, softDeleteOption);

  /**
   * Deletes a record from the database by ID.
   * @param {number|string} id - The ID of the record to delete.
   * @param {Transaction|null} [transaction=null] - Optional transaction for the delete operation.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to apply soft-delete or perform a hard delete.
   * @returns {Promise<void>} - No return value, record is deleted.
   * @example
   * await service.deleteDataById(1);
   */
  deleteDataById = async (id, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.deleteDataById(id, transaction, softDeleteOption);

  /**
   * Deletes records from the database based on a condition.
   * @param {object} condition - The condition to match the records. Use an empty object to delete all records.
   * @param {Transaction|null} [transaction=null] - Optional transaction for the delete operation.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to apply soft-delete or perform a hard delete.
   * @returns {Promise<number>} - The number of affected rows.
   * @example
   * const deletedRows = await service.deleteDataWithCondition({ status: 'inactive' });
   */
  deleteDataWithCondition = async (condition = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.deleteDataWithCondition(condition, transaction, softDeleteOption);

  /**
   * Fetches a single record by its ID with specific attributes.
   * 
   * @param {number|string} id - The ID of the record to fetch.
   * @param {Array<string>|null} [attributes=null] - The attributes to retrieve. If null, all attributes will be fetched.
   * @param {Transaction|null} [transaction=null] - Optional transaction for the fetch operation.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to apply the soft-delete filter.
   * @returns {Promise<object|null>} - The fetched record with the specified attributes or null if not found.
   * 
   * @example
   * const data = await service.getDataById(1, ['name', 'email']);
   * console.log(data); // Output: { name: 'John Doe', email: 'john.doe@example.com' }
   */
  getDataById = async (id, attributes = null, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.getDataById(id, attributes, transaction, softDeleteOption);


  /**
  * Retrieves all records that match the specified condition, with optional attribute selection, sorting, and transaction support.
  *
  * @param {object} condition - The condition to match the records. Use an empty object to fetch all records.
  * @param {Array<string>|null} [attributes=null] - The list of attributes (columns) to retrieve. If null, all attributes will be fetched.
  * @param {string} [orderBy=this.#primaryKey] - The field to order the results by. Defaults to the primary key of the table.
  * @param {string} [orderDir="DESC"] - The sorting direction for the orderBy field. Can be 'ASC' (ascending) or 'DESC' (descending). Defaults to 'DESC'.
  * @param {Transaction|null} [transaction=null] - Optional transaction object for executing the query within a database transaction.
  * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to apply the soft-delete condition to the query. Defaults to the class-level soft-delete setting.
  *
  * @returns {Promise<Array<object>>} - A promise that resolves to an array of records matching the condition and selected attributes.
  *
  * @example
  * // Fetch active users, retrieving only the name and email fields, ordered by the 'createdAt' field in ascending order.
  * const filteredData = await service.getAllData({ status: 'active' }, ['name', 'email'], 'createdAt', 'ASC');
  */
  getAllData = async (condition = {}, attributes = null, orderBy = this.#primaryKey, orderDir = "DESC", transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.getAllData(condition, attributes, orderBy, orderDir, transaction, softDeleteOption);

  /**
   * Fetches a single record with specific attributes based on a condition.
   * @param {object} condition - The condition to match the records. Use an empty object to fetch all records.
   * @param {Array<string>|null} [attributes=null] - The attributes to retrieve. If null, all attributes will be fetched.
   * @param {string} [orderBy=this.#primaryKey] - The field to order by.
   * @param {string} [orderDir="DESC"] - The direction to order by (ASC or DESC).
   * @param {Transaction|null} [transaction=null] - Optional transaction for the fetch operation.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to check for soft deletion.
   * @returns {Promise<object|null>} - The fetched record with specified attributes, or null if not found.
   * @example
   * const data = await service.getSingleDataWithCondition({ id: 1 }, ['name', 'email']);
   */
  getSingleDataWithCondition = async (condition = {}, attributes = null, orderBy = this.#primaryKey, orderDir = "DESC", transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.getSingleDataWithCondition(condition, attributes, orderBy, orderDir, transaction, softDeleteOption);


  /**
 * Fetches paginated data with optional attributes, sorting, search functionality, and transaction support.
 *
 * @param {object} [condition={}] - The condition to filter the records. If empty, all records are fetched.
 * @param {number} [page=1] - The page number to fetch. Defaults to 1.
 * @param {number} [limit=10] - The number of records per page. Defaults to 10.
 * @param {Array<string>|null} [attributes=null] - The list of attributes (columns) to retrieve. If null, all attributes will be fetched.
 * @param {string} [orderBy=this.#primaryKey] - The column to order the results by. Defaults to the primary key of the table.
 * @param {string} [orderDir="DESC"] - The sorting direction for the orderBy column. Can be 'ASC' (ascending) or 'DESC' (descending). Defaults to 'DESC'.
 * @param {string} [searchBy=""] - Optional search term to filter the data.
 * @param {Array<string>} [searchColumns=[]] - Optional array of columns to search by. If not provided, all columns will be searched.
 * @param {Transaction|null} [transaction=null] - Optional transaction object for executing the query within a database transaction.
 * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to include soft-delete conditions. Defaults to the class-level soft-delete setting.
 *
 * @returns {Promise<object>} - A promise that resolves to an object containing the paginated data, current page, limit, total record count, and total pages.
 *
 * @example
 * // Fetch users filtered by the name 'John', showing only the 'name' and 'email' fields, ordered by 'name' in ascending order.
 * const paginatedData = await service.getDataWithPagination({ name: "mangesh" }, 1, 10, ['name', 'email'], 'name', 'ASC', 'John', ['name']);
 */

  getDataWithPagination = async (condition = {}, page = 1, limit = 10, attributes = null, orderBy = this.#primaryKey, orderDir = "DESC", searchBy = "", searchColumns = [], transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {

    if (searchBy) {
      if (typeof searchColumns === 'string') {
        searchColumns = JSON.parse(searchColumns);
      }

      let modelKeys = await this.#repository.getModelKeys();

      let searchCondition = [];

      if (searchColumns.length > 0) {
        searchColumns.forEach(column => {
          if (modelKeys.includes(column)) {
            searchCondition.push({
              [column]: { [Op.like]: `%${searchBy}%` }
            });
          }
        });
      } else {
        modelKeys.forEach(column => {
          searchCondition.push({
            [column]: { [Op.like]: `%${searchBy}%` }
          });
        });
      }

      condition[Op.or] = searchCondition;
    }

    let data = await this.#repository.getDataWithPagination(condition, +page, +limit, attributes, orderBy, orderDir, transaction, softDeleteOption);

    let totalPages = Math.ceil(data.count / limit);

    return {
      data: data.rows,
      currentPage: page,
      limit,
      totalCount: data.count,
      totalPages,
    };
  };

  /**
   * Checks if data exists in the database based on the provided condition.
   * @param {object} condition - The condition to match the records. Use an empty object to fetch all records.
   * @param {Transaction|null} [transaction=null] - Optional transaction for the check operation.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to check for soft deletion.
   * @returns {Promise<boolean>} - True if the data exists, otherwise false.
   * @example
   * const exists = await service.dataExists({ id: 1 });
   */
  dataExists = async (condition = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.dataExists(condition, transaction, softDeleteOption);

  /**
   * Retrieves the total count of records that match the provided condition.
   *
   * @param {object} [condition={}] - The condition to filter the records. If empty, counts all records.
   * @param {Transaction|null} [transaction=null] - Optional transaction object for executing the count operation within a database transaction.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to apply soft-delete filtering during the count operation. Defaults to the class-level soft-delete setting.
   *
   * @returns {Promise<number>} - A promise that resolves to the total count of matching records.
   *
   * @example
   * // Get the total count of active users.
   * const totalCount = await service.getTotalCount({ status: 'active' });
   */

  getTotalCount = async (condition = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.getTotalCount(condition, transaction, softDeleteOption);

  /**
   * Retrieves the keys of the model (i.e., the field names).
   * @returns {Promise<Array<string>>} - An array of field names (model keys).
   * @example
   * const modelKeys = await service.getModelKeys();
   */
  getModelKeys = async () => await this.#repository.getModelKeys();

  /**
   * Retrieves the maximum value of a specific field based on the provided condition.
   *
   * @param {object} [condition={}] - The condition to filter the records. If empty, all records are considered.
   * @param {string} [field=this.#primaryKey] - The field to find the maximum value for. Defaults to the primary key of the table.
   * @param {Transaction|null} [transaction=null] - Optional transaction object for executing the fetch operation within a database transaction.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to apply soft-delete filtering during the operation. Defaults to the class-level soft-delete setting.
   *
   * @returns {Promise<number|null>} - A promise that resolves to the maximum value of the specified field, or null if no matching records are found.
   *
   * @example
   * // Get the maximum age of active users.
   * const maxAge = await service.getMaxData({ status: 'active' }, 'age');
   */

  getMaxData = async (condition = {}, field = this.#primaryKey, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) =>
    await this.#repository.getMaxData(condition, field, transaction, softDeleteOption);

  /**
   * Retrieves the name of the primary key field for the model.
   * @returns {string} - The name of the primary key field.
   * @example
   * const primaryKey = service.getPrimaryKeyField();
   */
  getPrimaryKeyField = () => this.#primaryKey;

}

module.exports = Service;

