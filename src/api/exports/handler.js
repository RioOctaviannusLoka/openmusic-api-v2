class ExportPlaylistsHandler {
    constructor(producerService, playlistsService, validator) {
        this._producerService = producerService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postExportPlaylistsByIdHandler = this.postExportPlaylistsByIdHandler.bind(this);
    }

    async postExportPlaylistsByIdHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;
        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        this._validator.exportPlaylistsPayloadValidation(request.payload);

        const message = {
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportPlaylistsHandler;