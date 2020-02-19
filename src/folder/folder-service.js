const FolderService = {
  getAllFolders(knexInstance) {
    return knexInstance("folder").select("*");
  },
  getById(knexInstance, id) {
    return knexInstance
      .from("folder")
      .select("*")
      .where("id", id)
      .first();
  },
  insertFolder(knexInstance, newFolder) {
    return knexInstance
      .insert(newFolder)
      .into("folder")
      .returning("*")
      .then(rows => {
        return rows[0];
      });
  },
  deleteFolder(knexInstance, id) {
    return knexInstance("folder")
      .where({ id })
      .delete();
  },
  updateFolder(knexInstance, id, newFolderFields) {
    return knexInstance("folder")
      .where({ id })
      .update(newFolderFields);
  }
};

module.exports = FolderService;
