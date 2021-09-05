let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  //save reference to the database
  const db = event.target.result;
  //create object to store
  db.createObjectStore("new_budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

//This will only happen if there is no internet connection
function saveRecord(record) {
  const transaction = db.transaction(["new_budget"], "readwrite");

  const budgetObjectStore = transaction.objectStore("new_budget");

  console.log(record);

  budgetObjectStore.add(record);
}

function uploadBudget() {
  const transaction = db.transaction(["new_budget"], "readwrite");

  const budgetObjectStore = transaction.objectStore("new_budget");

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverReponse);
          }

          //open one more transaction
          const transaction = db.transaction(["new_budget"], "readwrite");

          const budgetObjectStore = transaction.objectStore("new_budget");

          budgetObjectStore.clear();

          alert("All budget additions have been submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}
