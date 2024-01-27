/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
    },
    albumId: {
      type: 'VARCHAR(50)',
    },
  });

  pgm.addConstraint('songs', 'fk_album', {
    foreignKeys: {
      columns: 'albumId',
      references: 'albums(id)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_album');
  pgm.dropTable('songs');
};
