class AlbumsLikesHandler {
    constructor(albumsLikesService, albumsService) {
        this._albumsLikesService = albumsLikesService;
        this._albumsService = albumsService;

        this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
        this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);
        this.deleteAlbumLikeByIdHandler = this.deleteAlbumLikeByIdHandler.bind(this);
    }

    async postAlbumLikeHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsService.getAlbumById(albumId);
        await this._albumsLikesService.verifyLikedAlbum(albumId, credentialId);
        await this._albumsLikesService.addLike(albumId, credentialId);

        const response = h.response({
            status: 'success',
            message: 'Anda berhasil menyukai album',
        });
        response.code(201);
        return response;
    }

    async getAlbumLikesByIdHandler(request, h) {
        const { id: albumId } = request.params;

        await this._albumsService.getAlbumById(albumId);
        const { likes, cached } = await this._albumsLikesService.getLikes(albumId);

        const response = h.response({
            status: 'success',
            data: {
                likes,
            },
        });
        response.code(200);

        if (cached) {
            response.header('X-Data-Source', 'cache');
        }
        return response;
    }

    async deleteAlbumLikeByIdHandler(request) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsLikesService.deleteLike(albumId, credentialId);

        return {
            status: 'success',
            message: 'Anda berhasil tidak menyukai album',
        };
    }
}

module.exports = AlbumsLikesHandler;