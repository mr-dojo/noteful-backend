const NoteService = {
  getAllNotes(knexInstance) {
    return knexInstance("note").select("*");
  },
  getById(knexInstance, id) {
    return knexInstance
      .from("note")
      .select("*")
      .where("id", id)
      .first();
  },
  insertNote(knexInstance, newNote) {
    return knexInstance
      .insert(newNote)
      .into("note")
      .returning("*")
      .then(rows => {
        return rows[0];
      });
  },
  deleteNote(knexInstance, id) {
    return knexInstance("note")
      .where({ id })
      .delete();
  },
  updateNote(knexInstance, id, newNoteFields) {
    return knexInstance("note")
      .where({ id })
      .update(newNoteFields);
  }
};

module.exports = NoteService;
