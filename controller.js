/**
 * Author - Mangesh Balkawade : 7378336345
 * Controller class that manages HTTP request handling for CRUD operations.
 */


/**
 * @class Controller
 * @description Manages HTTP request handling for CRUD operations, leveraging a service layer for data management.
 * @property {Service} service - An instance of the Service class for managing data operations.
 * @property {boolean} logEnable - Flag to enable or disable logging of errors.
 * @property {string|null} primaryKey - Primary key field name for data operations.
 * @property {object} message - Predefined set of messages for various CRUD operations and errors.
 * @example
 * const controller = new Controller(userService);
 */
class Controller {
    #service = null;
    #logEnable = false;
    #primaryKey = null;

    #message = {
        DataNotAvailable: "No data available. Please check your request.",
        DataCreated: "Data saved successfully.",
        DataDeleted: "Data deleted successfully.",
        DataUpdated: "Data updated successfully.",
        DataFetched: "Data fetched successfully.",

        // Data Error Messages
        DataExists: "Data already exists. Please check your request.",
        UnableToSaveData: "Unable to save data.",
        UnableToFetchData: "Unable to fetch data.",
        UnableToUpdateData: "Unable to update data.",
        UnableToDeleteData: "Unable to delete data.",
        UnableToGetDataById: "Unable to get data by ID.",
        ForeignKeyConstraintError: "Invalid data: Please check the associated foreign keys.",

        InternalServerError: "Server issue, try after some time.",
    };

    /**
     * @constructor
     * @param {Service} service - The service instance responsible for handling data operations.
     * @param {boolean} [logEnable=false] - Enables logging of error messages.
     * @param {object|null} [messages=null] - Optional custom message object to override default messages.
     */
    constructor(service, logEnable = false, messages = null) {
        this.#service = service;
        if (messages) {
            Object.assign(this.#message, messages);
        }
        this.#logEnable = logEnable;
        this.#primaryKey = service.getPrimaryKeyField();
    }

    /**
     * Handles the creation of new data.
     * @param {object} req - Express request object containing the new data in req.body.
     * @param {object} res - Express response object.
     * @returns {Promise<object>} - JSON response with saved data and success message.
     */
    saveData = async (req, res) => {
        try {
            let data = req.body;
            let saveData = await this.#service.saveData(data);
            return this.handleSuccess(res, { saveData }, 201, this.#message.DataCreated);
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Updates existing data by ID.
     * @param {object} req - Express request object with data in req.body and ID in req.params.
     * @param {object} res - Express response object.
     * @returns {Promise<object>} - JSON response with updated data and success message.
     */
    updateData = async (req, res) => {
        try {
            let { id } = req.params;
            let existData = await this.#service.dataExists({ [this.#primaryKey]: id });

            if (!existData) {
                return this.handleError(res, null, 400, this.#message.DataNotAvailable);
            }

            let data = req.body;
            let updatedData = await this.#service.updateDataById(id, data);
            return this.handleSuccess(res, { updatedData }, 200, this.#message.DataUpdated);
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Deletes data by ID.
     * @param {object} req - Express request object with ID in req.params.
     * @param {object} res - Express response object.
     * @returns {Promise<object>} - JSON response with success message if data is deleted.
     */
    deleteData = async (req, res) => {
        try {
            let { id } = req.params;
            let existData = await this.#service.dataExists({ [this.#primaryKey]: id });

            if (!existData) {
                return this.handleError(res, null, 400, this.#message.DataNotAvailable);
            }

            await this.#service.deleteDataById(id);
            return this.handleSuccess(res, {}, 200, this.#message.DataDeleted);
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Fetches data by ID.
     * @param {object} req - Express request object with ID in req.params.
     * @param {object} res - Express response object.
     * @returns {Promise<object>} - JSON response with fetched data.
     */
    getDataById = async (req, res) => {
        try {
            let { id } = req.params;
            let data = await this.#service.getDataById(id);

            if (!data) {
                return this.handleError(res, null, 400, this.#message.DataNotAvailable);
            }

            return this.handleSuccess(res, { data });
        } catch (error) {
            return this.handleError(res, error);
        }
    }


    /**
     * Fetches all data.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @returns {Promise<object>} - JSON response with all fetched data.
     */
    getAllData = async (req, res) => {
        try {
            let data = await this.#service.getAllData();
            return this.handleSuccess(res, { data });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Fetches paginated data with optional sorting and filtering.
     * @param {object} req - Express request object with pagination, sorting, and filtering info in req.query.
     * @param {object} res - Express response object.
     * @returns {Promise<object>} - JSON response with paginated data.
     */
    getAllDataWithPagination = async (req, res) => {
        try {
            let { page = 1, limit = 10, orderBy = this.#primaryKey, orderDir = "DESC", searchBy = "", searchColumns = [] } = req.query;

            let data = await this.#service.getDataWithPagination({}, +page, +limit, null, orderBy, orderDir, searchBy, searchColumns);
            return this.handleSuccess(res, { data });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * Handles errors and sends error responses.
     * @param {object} res - Express response object.
     * @param {Error|null} error - Optional error object.
     * @param {number} [status=500] - HTTP status code.
     * @param {string} [message=this.message.InternalServerError] - Error message to be sent.
     * @returns {object} - JSON response with error details.
     */
    handleError = (res, error, status = 500, message = this.#message.InternalServerError) => {
        if (this.#logEnable && error) {
            console.log("Message: ", error.message);
            console.log("Stack: ", error.stack);
        }

        return res.status(status).json({
            data: {},
            message,
            status
        });
    }


    /**
     * Handles successful operations and sends success responses.
     * @param {object} res - Express response object.
     * @param {object} data - Data to be sent in the response.
     * @param {number} [status=200] - HTTP status code.
     * @param {string} [message=this.message.DataFetched] - Success message to be sent.
     * @returns {object} - JSON response with success details.
     */
    handleSuccess = (res, data, status = 200, message = this.#message.DataFetched) => {
        return res.status(status).json({
            data,
            message,
            status
        });
    }
}

module.exports = Controller;

