const addDays = require("date-fns/addDays");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error:${error.message}`);
    process.exit(1);
  }
};
initializeAndServer();

//API1
const convertedIntoResponseObject = (dbObject) => {
  if (dbObject.length > 1) {
    let array = [];
    for (let each of dbObject) {
      array.push({
        id: each.id,
        todo: each.todo,
        priority: each.priority,
        status: each.status,
        category: each.category,
        dueDate: each.due_date,
      });
    }
    return array;
  } else if (typeof dbObject !== Object && dbObject.length === 1) {
    return [
      {
        id: dbObject[0].id,
        todo: dbObject[0].todo,
        priority: dbObject[0].priority,
        status: dbObject[0].status,
        category: dbObject[0].category,
        dueDate: dbObject[0].due_date,
      },
    ];
  } else {
    return [
      {
        id: dbObject.id,
        todo: dbObject.todo,
        priority: dbObject.priority,
        status: dbObject.status,
        category: dbObject.category,
        dueDate: dbObject.due_date,
      },
    ];
  }
};

app.get("/todos/", async (request, response) => {
  try {
    let { status, priority, category, search_q } = request.query;

    if (status === "TO%20DO") {
      status = "TO DO";
    } else if (status === "IN%20PROGRESS") {
      status = "IN PROGRESS";
    }
    //scenario 1
    if (status === "TO DO") {
      const query = `
    select * from todo
    where status="${status}";`;
      const results = await db.all(query);
      const final = convertedIntoResponseObject(results);
      response.send(final);
    }
    //scenario2
    if (priority === "HIGH") {
      const query1 = `
        select * from todo
        where priority="${priority}";`;
      const results = await db.all(query1);
      const final = convertedIntoResponseObject(results);
      response.send(final);
    }
    //scenario3
    if (priority === "HIGH" && status === "IN PROGRESS") {
      const query2 = `
        select * from todo
        where status="${status}" AND priority="${priority}";`;
      const results = await db.all(query2);
      const final = convertedIntoResponseObject(results);
      response.send(final);
    }
    //scenario 4
    if (search_q !== undefined) {
      const query0 = `
        select * from todo
        where todo like "%${search_q}%";`;
      const results = await db.all(query0);
      const final = convertedIntoResponseObject(results);
      response.send(final);
    }
    //scenario5
    if (category === "WORK" && status === "DONE") {
      const query5 = `
        select * from todo
        where category = "${category}" AND status="${status}";`;
      const results = await db.all(query5);
      //console.log(results);
      response.send(convertedIntoResponseObject(results));
    }
    //scenario 6
    if (category === "HOME") {
      const query6 = `
        select * from todo
        where category="${category}";`;
      const results = await db.all(query6);
      response.send(convertedIntoResponseObject(results));
    }
    //scenario7
    if (category === "LEARNING" && priority === "HIGH") {
      const query7 = `
        select * from todo
        where category="${category}" AND priority="${priority}";`;
      const results = await db.all(query7);
      response.send(convertedIntoResponseObject(results));
    }
  } catch (error) {
    console.log(`API1 Error:${error.message}`);
  }
});
//API2
const convertedIntoResponseObject2 = (dbObject) => {
  //console.log(dbObject);
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};
app.get("/todos/:todoId", async (request, response) => {
  try {
    const { todoId } = request.params;
    const query = `
    select * from todo
    where id=${todoId};`;
    const results = await db.get(query);

    response.send(convertedIntoResponseObject2(results));
  } catch (error) {
    console.log(`API2 Error:${error.message}`);
  }
});
module.exports = app;
