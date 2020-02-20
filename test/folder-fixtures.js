function makeFolderArray() {
  return [
    {
      id: 1,
      name: "Important"
    },
    {
      id: 2,
      name: "Super"
    },
    {
      id: 3,
      name: "Spangley"
    },
    {
      id: 4,
      name: "Carlo Test"
    }
  ];
}

function makeFolderArrayNoId() {
  return [
    {
      name: "Important"
    },
    {
      name: "Super"
    },
    {
      name: "Spangley"
    },
    {
      name: "Carlo Test"
    }
  ];
}

module.exports = {
  makeFolderArray,
  makeFolderArrayNoId
};
