const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivities(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const insertQuery = {
      text: `INSERT INTO playlists_activities 
        VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
      values: [id, playlistId, songId, userId, action],
    };

    const result = await this._pool.query(insertQuery);
    if (!result.rows.length) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title,
      playlists_activities.action,
      playlists_activities.time
      FROM playlists_activities
      JOIN playlists ON playlists_activities.playlist_id = playlists.id
      JOIN users ON playlists.owner = users.id
      JOIN songs ON playlists_activities.song_id = songs.id
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ActivitiesService;
