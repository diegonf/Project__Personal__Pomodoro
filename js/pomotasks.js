// ********************************************* Chama todas as Funções  ********************************************* 
export function callTodoList() {
 
  loadList();
  
  const taskInput = document.querySelector('[data-todolist-input]');
  taskInput.addEventListener('keydown', function (event) {
    if (event.key == "Enter"){
      if (!(taskInput.value == null || taskInput.value == "")){
        setNewTask();
      }
    }
  });
  const taskInputEnter = document.querySelector('[data-todolist-enter]');
  taskInputEnter.addEventListener('click', () => {
    if (!(taskInput.value == null || taskInput.value == "")){
      setNewTask();
    }
  });
}

// ********************************************* Carrega a lista prévia de Tarefas  *********************************************
function loadList() {
  const currentTasks = JSON.parse(localStorage.getItem('taskList')) || [];
  const todoListUL = document.querySelector('[data-todolist-itens]'); //ul
  todoListUL.innerHTML = "";

  currentTasks.forEach((item, id) => {
    if (!item.taskDone){
      addItem(item, id)
    }
  });

  currentTasks.forEach((item, id) => {
    if (item.taskDone){
      addItem(item, id)
    }
  });
}

// ********************************************* set new task  *********************************************
function setNewTask () {
  const taskInput = document.querySelector('[data-todolist-input]'); //tarefa a ser executada

  'Atualizando tarefas no Local storage'
  const currentTasks = JSON.parse(localStorage.getItem('taskList')) || [];
  const newTask = setDataStructure(taskInput.value, false);
  const currentTasksUpdated = [...currentTasks, newTask];
  localStorage.setItem('taskList', JSON.stringify(currentTasksUpdated));
  taskInput.value = "";

  loadList(); //Calling function to reload list with new task added
}

// ********************************************* Set task done  *********************************************
function setTaskDone(doneButton, id) {
  const currentTasks = JSON.parse(localStorage.getItem('taskList'))

  if (!currentTasks[id].taskDone) {
    doneButton.parentElement.parentElement.classList.add('done');
    currentTasks[id].taskDone = true;
  } else {
    doneButton.parentElement.parentElement.classList.remove('done');
    currentTasks[id].taskDone = false;
  }

  localStorage.setItem('taskList', JSON.stringify(currentTasks));
  setTimeout(() => {
    loadList(); //Calling function to reload list with the changes
  }, 200);
  
}

// ********************************************* Delete task  *********************************************
function deleteTask(deleteButton, id) {
  const currentTasks = JSON.parse(localStorage.getItem('taskList'));
  currentTasks.splice(id,1);

  localStorage.setItem('taskList', JSON.stringify (currentTasks));
  setTimeout(() => {
    loadList(); //Calling function to reload list with the changes
  }, 200);
}

// ********************************************* Support Functions  *********************************************
function addItem(item, id) {
  const todoListUL = document.querySelector('[data-todolist-itens]'); //ul
  const todoListLI = document.createElement('li'); //li
  todoListLI.classList.add('pomotasks__item') //li class
  if (item.taskDone){
    todoListLI.classList.add('done') //li class
  }
  
  //Building <p>
  const todoListP = document.createElement('p'); //p
  const todoListText = document.createTextNode(item.task); //texto
  
  todoListP.classList.add('pomotasks__item--texto')
  todoListP.appendChild(todoListText);
  todoListLI.appendChild(todoListP); //Adding p element to LI

  //Building <div> with buttons
  const todoListDiv = document.createElement('div'); //div
  const todoListB1 = document.createElement('button'); //task done button
  const todoListB2 = document.createElement('button'); //delete button
  
  todoListDiv.classList.add('pomotasks__item--botoes');
  todoListB1.classList.add('pomotasks__item--check');
  todoListB1.classList.add('pomotasks__item--botao');
  todoListB1.addEventListener('click', () => {
    setTaskDone(todoListB1, id);
  });
  todoListB2.classList.add('pomotasks__item--excluir');
  todoListB2.classList.add('pomotasks__item--botao');
  todoListB2.addEventListener('click', () => {
    deleteTask(todoListB2, id);
  });
  
  todoListDiv.appendChild(todoListB1);
  todoListDiv.appendChild(todoListB2);
  todoListLI.appendChild(todoListDiv); //Adding div element to LI

  todoListUL.appendChild(todoListLI); //Add li to UL
}

function setDataStructure(task, taskDone) {
  const newTask = {
    task,
    taskDone
  };
  return newTask;
}