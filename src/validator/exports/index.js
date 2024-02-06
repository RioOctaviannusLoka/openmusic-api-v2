const ExportPlaylistsPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportPlaylistsValidator = {
    exportPlaylistsPayloadValidation: (payload) => {
        const ValidationResult = ExportPlaylistsPayloadSchema.validate(payload);

        if(ValidationResult.error) {
            throw new InvariantError(ValidationResult.error.message);
        }
    },
};

module.exports = ExportPlaylistsValidator;