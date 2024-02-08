const AlbumsLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'albumsLikes',
    version: '1.0.0',
    register: async (server, { albumsLikesService, albumsService }) => {
        const albumsLikesHandler = new AlbumsLikesHandler(albumsLikesService, albumsService);
        server.route(routes(albumsLikesHandler));
    },
};