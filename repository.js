
/**
 * Author - Mangesh Balkawade : 7378336345
 * A generic repository class to handle common database operations using Sequelize.
 * This class implements methods for CRUD operations, soft deletion, and more.
 */

/**
 * @class Repository
 * @description A generic repository class that provides an interface for performing CRUD operations
 * on a Sequelize model. It supports optional soft deletion and customizable messages for various operations.
 * 
 * @property {Model} #model - The Sequelize model used for database operations.
 * @property {string|null} #primaryKey - The primary key field name of the model.
 * @property {string|null} #softDeleteKey - The key used for soft deletion (if applicable).
 * @property {boolean} #softDeleteDefaultValue - The default value indicating whether a record is considered deleted.
 * @property {object} #messages - Predefined messages for various success and error scenarios.
 * 
 * @example
 * const userRepository = new Repository(UserModel, 'isDeleted', true);
 */

class Repository {
    #model = null;
    #primaryKey = null;
    #softDeleteKey = null;
    #softDeleteDefaultValue = false;

    #messages = {
        // Data Success Messages
        DataNotAvailable: "No data available. Please check your request.",
        // Data Error Messages
        DataExists: "Data already exists. Please check your request.",
        ForeignKeyConstraintError: "Invalid data: Please check the associated foreign keys.",
    }

    /**
     * Initializes a new instance of the Repository class.
     * @param {Model} model - The Sequelize model to be used for database operations.
     * @param {string|null} [softDeleteKey=null] - The key used for soft deletion.
     * @param {boolean} [softDeleteDefaultValue=false] - The default value for the soft delete key.
     * @param {object|null} [messages=null] - Custom messages for various operations.
     */
    constructor(model, softDeleteKey = null, softDeleteDefaultValue = false, messages = null) {
        this.#model = model;
        this.#primaryKey = this.#model.primaryKeyAttribute;
        this.#softDeleteKey = softDeleteKey;
        if (messages) {
            Object.assign(this.#messages, messages);
        }
        this.#softDeleteDefaultValue = softDeleteDefaultValue;
    }

    /**
      * Saves a single record to the database.
      * @param {object} data - The data to be saved.
      * @param {Transaction|null} [transaction=null] - The transaction to be used.
      * @returns {Promise<object>} - The saved data.
      */
    saveData = async (data, transaction = null) => {
        let savedData = await this.#model.create(data, { transaction });
        return savedData;
    }

    /**
     * Saves multiple records to the database.
     * @param {Array<object>} data - The data to be saved.
     * @param {Transaction|null} [transaction=null] - The transaction to be used.
     * @returns {Promise<Array<object>>} - The saved data.
     */
    saveBulkData = async (data, transaction = null) => {
        let savedData = await this.#model.bulkCreate(data, { transaction });
        return savedData;
    }

    /**
     * Updates a record by its ID.
     * @param {number|string} id - The ID of the record to update.
     * @param {object} data - The new data for the record.
     * @param {Transaction|null} [transaction=null] - The transaction to be used.
     * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to check for soft deletion.
     * @returns {Promise<object>} - The updated record.
     */
    updateDataById = async (id, data, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        let whereCondition = {};
        whereCondition[this.#primaryKey] = id;

        if (softDeleteOption) {
            whereCondition[this.#softDeleteKey] = 0;
        }

        let existData = await this.#model.findOne({
            where: whereCondition,
            transaction
        });

        if (!existData) {
            throw new Error(this.#messages.DataNotAvailable);
        }

        Object.assign(existData, data);
        let updatedData = await existData.save({ transaction });
        return updatedData;
    }

    /**
     * Updates multiple records based on a condition.
      * @param {object} condition - The condition to match the records. Use an empty object to update all records.
     * @param {object} data - The new data for the records.
     * @param {Transaction|null} [transaction=null] - The transaction to be used.
     * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to check for soft deletion.
     * @returns {Promise<[number, object[]]>} - The number of affected rows and affected rows data.
     */
    updateDataWithCondition = async (condition = {}, data = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        if (condition == null) {
            condition = {}
        }
        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
        }

        let updatedData = await this.#model.update(data, {
            where: condition,
            transaction
        });

        return updatedData;
    }

    /**
     * Deletes multiple records based on a condition.
     * @param {object} condition - The condition to match the records. Use an empty object to delete all records.
     * @param {Transaction|null} [transaction=null] - The transaction to be used.
     * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to perform a soft delete.
     * @returns {Promise<number>} - The number of rows affected.
     */
    deleteDataWithCondition = async (condition = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        let removedRows = 0;

        if (condition == null) {
            condition = {}
        }

        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
            removedRows = await this.#model.update(
                { [this.#softDeleteKey]: 1 },
                { where: condition, transaction }
            );
            removedRows = removedRows?.[0];
        } else {
            removedRows = await this.#model.destroy({
                where: condition,
                transaction
            });
        }

        return removedRows;
    }

    /**
     * Deletes a single record by its ID.
     * @param {number|string} id - The ID of the record to delete.
     * @param {Transaction|null} [transaction=null] - The transaction to be used.
     * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to perform a soft delete.
     * @returns {Promise<boolean>} - True if the delete was successful.
     */
    deleteDataById = async (id, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        let whereCondition = { [this.#primaryKey]: id };

        if (softDeleteOption) {
            whereCondition[this.#softDeleteKey] = 0;
        }

        let data = await this.#model.findOne({
            where: whereCondition,
            transaction
        });

        if (!data) {
            throw new Error(this.#messages.DataNotAvailable);
        }

        if (softDeleteOption) {
            data[this.#softDeleteKey] = 1;
            await data.save({ transaction });
        } else {
            await data.destroy({ transaction });
        }

        return true;
    }

    /**
     * Retrieves a single record by its ID with specified attributes.
     * @param {number|string} id - The ID of the record to retrieve.
     * @param {Array<string>|null} [attributes=null] - The attributes to retrieve. If null, all attributes will be retrieved.
     * @param {Transaction|null} [transaction=null] - Optional transaction to be used.
     * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to include only non-soft-deleted records (default is based on softDeleteDefaultValue).
     * @returns {Promise<object|null>} - A Promise that resolves to the retrieved record, or null if not found.
     */
    getDataById = async (id, attributes = null, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        let whereCondition = { [this.#primaryKey]: id };

        if (softDeleteOption) {
            whereCondition[this.#softDeleteKey] = 0;
        }

        let data = await this.#model.findOne({
            where: whereCondition,
            attributes,
            transaction
        });

        return data;
    }

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
    getAllData = async (condition = {}, attributes = null, orderBy = this.#primaryKey, orderDir = "DESC", transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {

        if (condition == null) {
            condition = {}
        }

        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
        }

        let data = await this.#model.findAll({
            where: condition,
            transaction,
            attributes,
            order: [[orderBy, orderDir]]
        });

        return data;
    }

    /**
   * Retrieves a single record with specific attributes based on a condition.
   * @param {object} condition - The condition to match the records. Use an empty object to fetch all records.
   * @param {Array<string>|null} [attributes=null] - The attributes to retrieve. If null, all attributes will be retrieved.
   * @param {string} [orderBy=this.#primaryKey] - The field to order by.
   * @param {string} [orderDir="DESC"] - The direction to order by (ASC or DESC).
   * @param {Transaction|null} [transaction=null] - The transaction to be used.
   * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to check for soft deletion.
   * @returns {Promise<object|null>} - The retrieved record, or null if not found.
   */
    getSingleDataWithCondition = async (condition = {}, attributes = null, orderBy = this.#primaryKey, orderDir = "DESC", transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {

        if (condition == null) {
            condition = {}
        }

        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
        }

        let data = await this.#model.findOne({
            where: condition,
            transaction,
            attributes,
            order: [[orderBy, orderDir]]
        });

        return data;
    }

    /**
     * Retrieves records with pagination and specific attributes based on a condition.
    * @param {object} [condition={}] - The condition to filter the records. If empty, all records are fetched.
    * @param {number} [page=1] - The page number to fetch. Defaults to 1.
    * @param {number} [limit=10] - The number of records per page. Defaults to 10..
     * @param {Array<string>|null} [attributes=null] - The attributes to retrieve. If null, all attributes will be retrieved.
     * @param {string} [orderBy=this.#primaryKey] - The field to order by.
     * @param {string} [orderDir="DESC"] - The direction to order by (ASC or DESC).
     * @param {Transaction|null} [transaction=null] - The transaction to be used.
     * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to check for soft deletion.
     * @returns {Promise<{count: number, rows: Array<object>}>} - The retrieved records with count and rows.
     */
    getDataWithPagination = async (condition = {}, page = 1, pageSize = 10, attributes = null, orderBy = this.#primaryKey, orderDir = "DESC", transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        let offset = (page - 1) * pageSize;

        if (condition == null) {
            condition = {}
        }

        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
        }

        let data = await this.#model.findAndCountAll({
            where: condition,
            limit: pageSize,
            offset,
            attributes,
            distinct: true,
            order: [[orderBy, orderDir]],
            transaction
        });
        return data;
    }

    /**
     * Checks if any record exists that matches a given condition.
   * @param {object} condition - The condition to match the records. Use an empty object to fetch all records.
     * @param {Transaction|null} [transaction=null] - Optional transaction.
     * @param {boolean} [softDeleteOption=this.#softDeleteDefaultValue] - Whether to apply soft delete condition.
     * @returns {Promise<boolean>} - Returns true if any record exists, otherwise false.
     */
    dataExists = async (condition = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        if (condition == null) {
            condition = {}
        }

        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
        }

        let count = await this.#model.count({
            where: condition,
            transaction
        });

        return count > 0;
    }

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

    getTotalCount = async (condition = {}, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        if (condition == null) {
            condition = {}
        }

        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
        }

        let count = await this.#model.count({
            where: condition,
            transaction
        });

        return count;
    }

    /**
     * Retrieves the keys of the model's attributes.
     * @returns {Promise<Array<string>>} - The list of attribute keys.
     */
    getModelKeys = async () => {
        let keys = Object.keys(await this.#model.describe());
        return keys;
    }

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

    getMaxData = async (condition = {}, field = this.#primaryKey, transaction = null, softDeleteOption = this.#softDeleteDefaultValue) => {
        if (condition == null) {
            condition = {}
        }

        if (softDeleteOption) {
            condition[this.#softDeleteKey] = 0;
        }

        let data = await this.#model.max(
            field,
            {
                where: condition,
                transaction
            }
        );

        return data;
    }

    /**
     * Retrieves the primary key field name used by the service.
     * @returns {string|null} - The primary key field name.
     * @example
     * const primaryKey = service.getPrimaryKeyField();
     * console.log(primaryKey); // Output: 'id' (or whatever primary key is set)
     */
    getPrimaryKeyField = () => {
        return this.#primaryKey;
    }

    /**
     * Retrieves the default value used for soft delete operations.
     * This value is used to determine whether soft deletion filtering is applied in queries.
     * 
     * @returns {boolean} - The default soft delete option value.
     * @example
     * const softDeleteOption = service.getSoftDeleteOption();
     * console.log(softDeleteOption); // Output: true (or whatever the default value is)
   */
    getSoftDeleteOption = () => {
        return this.#softDeleteDefaultValue;
    }
}

module.exports = Repository;
