export enum PrismaErrorCodes {
    VALUE_TOO_LONG = 'P2000', // The provided value for the column is too long for the column's type.
    RECORD_NOT_FOUND = 'P2001', // The record searched for in the where condition does not exist.
    UNIQUE_CONSTRAINT_FAILED = 'P2002', // Unique constraint failed on the constraint.
    FOREIGN_KEY_CONSTRAINT_FAILED = 'P2003', // Foreign key constraint failed on the field.
    CONSTRAINT_FAILED = 'P2004', // A constraint failed on the database.
    INVALID_FIELD_VALUE = 'P2005', // The value stored in the database for the field is invalid for the field's type.
    INVALID_FIELD = 'P2006', // The provided value for the field is not valid.
    DATA_VALIDATION_ERROR = 'P2007', // Data validation error.
    QUERY_PARSING_ERROR = 'P2008', // Failed to parse the query at the specified position.
    QUERY_VALIDATION_ERROR = 'P2009', // Failed to validate the query at the specified position.
    RAW_QUERY_FAILED = 'P2010', // Raw query failed with a specific code and message.
    NULL_CONSTRAINT_VIOLATION = 'P2011', // Null constraint violation on the specified constraint.
    MISSING_REQUIRED_VALUE = 'P2012', // Missing a required value at the specified path.
    MISSING_REQUIRED_ARGUMENT = 'P2013', // Missing the required argument for the specified field.
    RELATION_VIOLATION = 'P2014', // The change would violate the required relation between the models.
    RELATED_RECORD_NOT_FOUND = 'P2015', // A related record could not be found.
    QUERY_INTERPRETATION_ERROR = 'P2016', // Query interpretation error.
    RELATION_NOT_CONNECTED = 'P2017', // The records for relation are not connected.
    CONNECTED_RECORDS_NOT_FOUND = 'P2018', // The required connected records were not found.
    INPUT_ERROR = 'P2019', // Input error.
    VALUE_OUT_OF_RANGE = 'P2020', // Value out of range for the type.
    TABLE_DOES_NOT_EXIST = 'P2021', // The table does not exist in the current database.
    COLUMN_DOES_NOT_EXIST = 'P2022', // The column does not exist in the current database.
    INCONSISTENT_COLUMN_DATA = 'P2023', // Inconsistent column data.
    CONNECTION_POOL_TIMEOUT = 'P2024', // Timed out fetching a new connection from the connection pool.
    REQUIRED_RECORDS_NOT_FOUND = 'P2025', // An operation failed because it depends on one or more records that were required but not found.
    UNSUPPORTED_FEATURE = 'P2026', // The current database provider doesn't support a feature that the query used.
    MULTIPLE_DATABASE_ERRORS = 'P2027', // Multiple errors occurred on the database during query execution.
    TRANSACTION_ERROR = 'P2028', // Transaction API error.
    QUERY_PARAMETER_LIMIT_EXCEEDED = 'P2029', // Query parameter limit exceeded error.
    FULLTEXT_INDEX_NOT_FOUND = 'P2030', // Cannot find a fulltext index to use for the search.
  }