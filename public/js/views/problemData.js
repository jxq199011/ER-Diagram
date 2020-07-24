/* problem Dataset rules: 
1. terms: all the terms included in the solution, repeated ones should only put one.
2. entity object: include all types, 
3. composite, first index is the name of the main attribute, like name, then firstName, lastname...
4. relation, first index is the number of relation of the entity, second index is the relation name, third index is its attribute if have
5. iden-relation, same as relation
6. one relation and one iden-relation per entity
7. weak-entity object: include the entity text, key, attribute, composite and derived
*/

// Problem-1 statement information
var terms01 = ['student', 'number', 'name', 'address', 'phone','gender', 'date_of_birth', 'first', 'last'];
// Problem dataset Per Entity
var entArr01 = [
  {
    entiText: 'student', 
    keysText: ['number'], 
    attrsText:['name','address', 'phone','gender', 'date_of_birth'],
    composite:['name','first','last'], 
    derisText:[], 
    relation:[0], 
    idReText:[0]
  },
  {
    entityNum: 1,
    weakEntNum: 0
  }
];
// problem 2
var terms02 =['airplane','economy_class_seats','year','registration_number', 'type', 'business_class_seats'];
var entArr02 =[
  {
    entiText: 'airplane', 
    keysText: ['registration_number'], 
    attrsText:['economy_class_seats','year', 'type','business_class_seats'],
    composite:[], 
    derisText:[], 
    relation:[0], 
    idReText:[0]
  },
  {
    entityNum: 1,
    weakEntNum: 0
  }
];
//problem 3
var terms03 =['course', 'code', 'lecture', 'semester','tutorials','name'];
var entArr03 =[
  {
    entiText: 'course', 
    keysText: ['code'], 
    attrsText:['lecture','name', 'tutorials','semester'],
    composite:[], 
    derisText:[], 
    relation:[0], 
    idReText:[0]
  },
  {
    entityNum: 1,
    weakEntNum: 0
  }
];
// problem 4
var terms04 =['car','chassis','engine','year','plates','power','make', 'model', 'colour', 'Cc', 'passengers'];
var entArr04 =[
  {
    entiText: 'car', 
    keysText: ['engine','chassis','plates'], 
    attrsText:['year','power', 'make','model','Cc', 'passengers'],
    composite:[], 
    derisText:['colour'], 
    relation:[0], 
    idReText:[0]
  },
  {
    entityNum: 1,
    weakEntNum: 0
  }
];

// Problem-5 statement information
var terms05 = ["students", "number", "name", "live_in", "hall", "address"];
// Problem-5 dataset Per Entity
var entArr05 = [
  {
    entiText: "students",
    keysText: ["number"],
    attrsText: ["name"],
    composite: [],
    derisText: [],
    relation: [1, "live_in"],
    idReText: [0],
  },
  {
    entiText: "hall",
    keysText: ["name"],
    attrsText: ["address"],
    composite: [],
    derisText: [],
    relation: [],
    idReText: [0],
  },
  {
    entityNum: 2,
    weakEntNum: 0
  }
];
// problem 6
var terms06 =['text_book','isbn', 'contains', 'chapter', 'number_of_references', 'number_of_pages', 'topic', 'chapter_number'];
var entArr06 =[
  {
    entiText: 'text_book', 
    keysText: ['isbn'], 
    attrsText:[],
    composite:[], 
    derisText:[], 
    relation:[0], 
    idReText:[1, 'contains']
  },
  {
    weakEntiText: 'chapter', 
    keysText:['chapter_number'], 
    attrsText:['topic','number_of_pages','number_of_references'], 
    composite:[], 
    derisText:[]
  },
  {
    entityNum: 1,
    weakEntNum: 1
  }
];
//problem 7
var terms07 =['lecturer', 'name', 'number','phone', 'teaches', 'course','code','title'];
var entArr07 =[
  {
    entiText: 'lecturer', 
    keysText: ['number'], 
    attrsText:['name','phone'],
    composite:[], 
    derisText:[], 
    relation:[1,'teaches'], 
    idReText:[0]
  },
  {
    entiText: 'course', 
    keysText: ['code'], 
    attrsText:['title'],
    composite:[], 
    derisText:[], 
    relation:[0], 
    idReText:[0]
  },
  {
    entityNum: 2,
    weakEntNum: 0
  }
];
//problem 8
var terms08 =['student', 'name', 'id','address', 'passed', 'grade','course','code'];
var entArr08 =[
  {
    entiText: 'student', 
    keysText: ['id'], 
    attrsText:['name','address'],
    composite:[], 
    derisText:[], 
    relation:[1,'passed','grade'], 
    idReText:[0]
  },
  {
    entiText: 'course', 
    keysText: ['code'], 
    attrsText:[],
    composite:[], 
    derisText:[], 
    relation:[0], 
    idReText:[0]
  },
  {
    entityNum: 2,
    weakEntNum: 0
  }
];

//problem 9
var terms09 =['course','code','requires','text_book','isbn','publisher','title','author','year'];
var entArr09 =[
  {
    entiText: 'course', 
    keysText: ['code'], 
    attrsText:[],
    composite:[], 
    derisText:[], 
    relation:[1, "requires"], 
    idReText:[0]
  },
  {
    entiText: 'text_book', 
    keysText: ['isbn'], 
    attrsText:['publisher','title', 'year'],
    composite:[], 
    derisText:['author'], 
    relation:[0], 
    idReText:[0]
  },
  {
    entityNum: 2,
    weakEntNum: 0
  }
];
// problem 10
var terms10 =['building','address','phone','has', 'location','sensor','number', 'manufacturer', 'model','unit', 'interval', 'initialization_sequence', 'maximal_value', 'state', 'critical', 'activated','signal_value', 'alarm', 'date', 'time'];
var entArr10 =[
  {
    entiText: 'building', 
    keysText: ['address'], 
    attrsText:['phone'],
    composite:[], 
    derisText:[], 
    relation:[1, 'has','location'], 
    idReText:[0]
  },
  {
    entiText: 'sensor', 
    keysText: ['number'], 
    attrsText:['manufacturer','model', 'unit','interval', 'initialization_sequence', 'maximal_value','state', 'critical'],
    composite:[], 
    derisText:[], 
    relation:[0], 
    idReText:[1,'activated','signal_value']
  },
  {
    weakEntiText: 'alarm', 
    keysText:['date'], 
    attrsText:['time'], 
    composite:[], 
    derisText:[]
  },
  {
    entityNum: 2,
    weakEntNum: 1
  }
];
// array of problem datasets
var datasets = [[terms01, entArr01], [terms02, entArr02],[terms03, entArr03],[terms04, entArr04],[terms05, entArr05],
[terms06, entArr06],[terms07, entArr07],[terms08, entArr08],[terms09, entArr09], [terms10, entArr10]];
