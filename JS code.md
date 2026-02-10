// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

// console.log("Welcome to Programiz!");

const Avengers = [
  {
    fname: 'tony',
    lname: 'stark',
    age: 30,
    gender: 'M',
    powers: ['intelligence', 'money'],
  },
  {
    fname: 'natasha',
    lname: 'romonov',
    age: 23,
    gender: 'F',
    powers: ['intelligence', 'slow ageing'],
  },
];

function Select(stringToSelect, from) {
  const propertiesToSelect = stringToSelect.split(',');

  const result = from.map(element => {
    const selectedValues = {};
    propertiesToSelect.forEach(property => {
      selectedValues[property] = element[property];
    });
    return selectedValues;
  });

  return result;
}

const list = Select('fname,lname,age', Avengers);

console.log(list);

===============================

const users = [
  {
    name: "Alice",
    age: 28,
    purchases: [
      { item: "Book", price: 12 },
      { item: "Pen", price: 3 }
    ]
  },
  {
    name: "Bob",
    age: 17,
    purchases: [
      { item: "Game", price: 50 }
    ]
  },
  {
    name: "Charlie",
    age: 22,
    purchases: [
      { item: "Notebook", price: 7 },
      { item: "Backpack", price: 45 }
    ]
  }
];

const adultUsers = users.filter(user => user.age >= 18);

const usersWithTotal = adultUsers.map(user => {
  const totalSpent = user.purchases.reduce(
    (sum, purchase) => sum + purchase.price,
    0
  );

  return {
    name: user.name,
    totalSpent
  };
});

const totalRevenue = usersWithTotal.reduce(
  (sum, user) => sum + user.totalSpent,
  0
);

console.log(usersWithTotal);
console.log(totalRevenue);



==========================================================================
// db.js
export const studentsDB = [
  { id: 1, name: "Rahul", classId: 101 },
  { id: 2, name: "Anita", classId: 102 }
];

export const classesDB = [
  { id: 101, name: "Maths" },
  { id: 102, name: "Science" }
];

export function fetchStudents() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(studentsDB), 500);
  });
}

export function fetchClassById(classId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cls = classesDB.find(c => c.id === classId);
      cls ? resolve(cls) : reject("Class not found");
    }, 500);
  });
}





const arr = ["a","b","a","c","b","a","d","f"];

const count = arr.reduce((acc, cur) => {
  acc[cur] = (acc[cur] || 0) + 1;
  return acc;
}, {});

console.log(count)



const users = [{id:1,name:"A"}, {id:2,name:"B"}];

const obj = users.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});

console.log(obj)






// studentService.js
// import { fetchStudents, fetchClassById } from "./db.js";

export async function getStudentsWithClass() {
  try {
    const students = await fetchStudents();

    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const cls = await fetchClassById(student.classId);
        return {
          ...student,
          className: cls.name
        };
      })
    );

    return enrichedStudents;
  } catch (error) {
    throw new Error(error);
  }
}

async function dataDisp () {
console.log(await getStudentsWithClass())
}

console.log(dataDisp())

// dataDisp()



========================
# JS Tricky

A
G
I
F
C
E
D
H
B

console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("C");

    return Promise.resolve("D");
  })
  .then((val) => {
    console.log(val);
  });

queueMicrotask(() => {
  console.log("E");
});

process.nextTick(() => {
  console.log("F");
});

(async function () {
  console.log("G");
  await null;
  console.log("H");
})();

console.log("I");

=========================================

console.log("1");

setTimeout(() => {
  console.log("2");

  Promise.resolve().then(() => {
    console.log("3");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("4");

  setTimeout(() => {
    console.log("5");
  }, 0);
});

console.log("6");

1 6 4 2 3 5

==============================================================

console.log("1");

process.nextTick(() => {
  console.log("2");

  process.nextTick(() => {
    console.log("3");
  });

  Promise.resolve().then(() => {
    console.log("4");
  });

  setTimeout(() => {
    console.log("5");

    process.nextTick(() => {
      console.log("6");
    });
  }, 0);
});

Promise.resolve().then(() => {
  console.log("7");

  process.nextTick(() => {
    console.log("8");
  });

  setTimeout(() => {
    console.log("9");
  }, 0);
});

setTimeout(() => {
  console.log("10");

  process.nextTick(() => {
    console.log("11");
  });

  Promise.resolve().then(() => {
    console.log("12");
  });
}, 0);

console.log("13");


1
13
2
3
7
4
8
5
6
9
10
11
12







