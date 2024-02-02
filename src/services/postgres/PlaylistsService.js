const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const insertQuery = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(insertQuery);

    if(!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const selectQuery = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      FULL JOIN collaborations ON playlists.id = collaborations.playlist_id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(selectQuery);
    return result.rows;
  }

  async getPlaylistById(id) {
    const selectQuery = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(selectQuery);
    
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const deleteQuery = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    
    const result = await this._pool.query(deleteQuery);
    
    if (!result.rows.length) {
        throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongtoPlaylist(playlistId, songId) {
    const id=`playlists_songs-${nanoid(16)}`;
    const insertQuery = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(insertQuery);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getSongsfromPlaylist(playlistId) {
    const selectQuery = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlists_songs
      LEFT JOIN songs ON playlists_songs.song_id = songs.id
      WHERE playlists_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(selectQuery);
    return result.rows;
  }

  async deleteSongfromPlaylist(songId) {
    const deleteQuery = {
      text: 'DELETE FROM playlists_songs WHERE song_id = $1',
      values: [songId],
    };

    const result = await this._pool.query(deleteQuery);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const selectQuery = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(selectQuery);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak dapat ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki hak akses');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
