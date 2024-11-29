
let a;

a = {
    "uuid_front": "root",
    "children": [
      {
        "uuid_front": "1",
        "children": [
          { "uuid_front": "1.1", "children": [] },
          { "uuid_front": "new" }
        ]
      },
      { "uuid_front": "new" },
      {
        "uuid_front": "2",
        "children": []
      }
    ]
  }


  insertObject2({uuid_front: 'appended'}, a, '2', 'children')

  insertObject2({uuid_front: 'appended'}, a, '1.1', 'children')

  a.children[0].children[0].children

  