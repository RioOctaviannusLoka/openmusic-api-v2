const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class AlbumsLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addLike(albumId, userId) {
        const id = `like-${nanoid(16)}`;

        const insertQuery = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        const result = await this._pool.query(insertQuery);

        if (!result.rows[0].id) {
            throw new InvariantError('Like gagal ditambahkan');
        }
        await this._cacheService.delete(`likes:${albumId}`);
    }

    async getLikes(albumId) {
        try {
            const result = await this._cacheService.get(`likes:${albumId}`);
            return {
                likes: JSON.parse(result),
                cached: true,
            };
        } catch (error) {
            const selectQuery = {
                text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };
    
            const result = await this._pool.query(selectQuery);
    
            if (!result.rows.length) {
                throw new NotFoundError('Album tidak dapat ditemukan');
            }
            
            await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result.rows.length));

            return {
                likes: result.rows.length,
                cached: false,
            };
        }
    }

    async deleteLike(albumId, userId) {
        const deleteQuery = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        };

        const result = await this._pool.query(deleteQuery);

        if (!result.rows.length) {
            throw new NotFoundError('Like gagal dihapus. Id tidak dapat ditemukan');
        }

        await this._cacheService.delete(`likes:${albumId}`);
    }

    async verifyLikedAlbum(albumId, userId) {
        const selectQuery = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        const result = await this._pool.query(selectQuery);

        if (result.rowCount > 0) {
            throw new ClientError('Anda sudah pernah menyukai album ini');
        }
    }
}

module.exports = AlbumsLikesService;