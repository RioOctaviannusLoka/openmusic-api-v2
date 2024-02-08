class UploadsHandler {
    constructor(storageService, albumsService, validator) {
        this._storageService = storageService;
        this._albumsService = albumsService;
        this._validator = validator;

        this.postAlbumsCoversByIdHandler = this.postAlbumsCoversByIdHandler.bind(this);
    }

    async postAlbumsCoversByIdHandler(request, h) {
        const { id } = request.params;
        const { cover } = request.payload;
        this._validator.imageHeadersValidation(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/${id}/${filename}`;

        await this._albumsService.addAlbumCover(id, fileLocation);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;