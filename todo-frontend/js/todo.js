$(function() {
  var API_VERSION = "1"
  var API_ENDPOINT = "http://localhost:3000/v" + API_VERSION 

  var APICallCommand = {
    "GetList": 1,
    "CreateTodo": 2,
    "UpdateTodo": 3,
    "DeleteTodo": 4
  }

  var AllTodoItems = []
  var FilteredTodoItems = []

  //AJAX generic function
  var apiCall = function(command, 
                         obj, 
                         successCb = function(){}, 
                         errorCb = function(){ alert("Something went wrong!!!") }) {
    var path = ""
    var method = ""
    
    if (command == APICallCommand.GetList) {
      path += "/todos"
      method = "get"
    }
    else if (command == APICallCommand.CreateTodo) {
      path += "/todos"
      method = "post"
    }
    else if (command == APICallCommand.UpdateTodo) {
      path += "/todos/" + obj.todo.id
      method = "patch"
    }
    else if (command == APICallCommand.DeleteTodo) {
      path += "/todos/" + obj.todo.id
      method = "delete"
    }

    $.ajax({
      url: API_ENDPOINT + path,
      type: method,
      success: successCb,
      error: errorCb,
      data: obj
    })
  }

  var refreshTodoList = function() {
    if (FilteredTodoItems.length == 0) {
      $('.todo-list').hide();
      $('.empty-todo-list-message').show();
      $('.todo-list-filters').hide();
    } else {
      var template = $.templates("#todo-item-template");
      $('.todo-list').html(template.render(FilteredTodoItems));
      addCallbacksToTodoItems();
      $('.todo-list').show();
      $('.empty-todo-list-message').hide();
      $('.todo-list-filters').show();
    }
  }

  //API Methods
  var getTodoList = function() {
    apiCall(APICallCommand.GetList, null, 
      function(data) {
        AllTodoItems = data
        FilteredTodoItems = AllTodoItems.slice()
        refreshTodoList()
      }
    )
  }

  var createTodo = function(title, finishCb = function() {}) {
    var newTodo = {
      "todo": {
        title: title
      }
    }

    apiCall(APICallCommand.CreateTodo, newTodo, 
      function(data) {
        AllTodoItems.push(data);
        FilteredTodoItems.push(data);

        $('#todo-filter-all').click();
        finishCb(data);
      }
    )
  }

  var updateTodo = function(todo, finishCb = function() {}) {
    apiCall(APICallCommand.UpdateTodo, {"todo": todo}, 
      function(data) {
        todoData = $.grep(FilteredTodoItems, function(todo, index) {
          if (data.id == todo.id) {
            return {'todo': todo, 'index': index};
          }
        })[0];
        FilteredTodoItems[todoData.index] = todoData.todo;
        refreshTodoList();
        finishCb(data);
      }
    )
  }

  var deleteTodo = function(todo, finishCb = function() {}) {
    apiCall(APICallCommand.DeleteTodo, {"todo": todo}, 
      function(data) {
        //Find todo index of filtered array
        filteredTodoIndex = $.map(FilteredTodoItems, function(currentTodo, index) {
          if (currentTodo.id == todo.id) {
            return index;
          }
        })[0];

        //Find todo index of original array
        todoIndex = $.map(AllTodoItems, function(currentTodo, index) {
          if (currentTodo.id == todo.id) {
            return index;
          }
        })[0];

        //Remove todo items from both arrays
        FilteredTodoItems.splice(filteredTodoIndex, 1);
        AllTodoItems.splice(todoIndex, 1);

        if (AllTodoItems.length > 0 && FilteredTodoItems.length == 0) {
          $('#todo-filter-all').click();
        } else {
          refreshTodoList();
        }

        finishCb();
      }
    )
  }

  $('#todo-input').keypress(function(e) {
    if (e.which == 13) {
      if ($(this).val() != "") {
        createTodo($(this).val(), function() {
          $('#todo-input').val('');
        });
      }
    }
  });

  //Edit todo in-place
  var updateEditInPlaceInputField = function(selectedSpan, inputField) {
    if (inputField.val() != "") {
      selectedSpan.text(inputField.val());
    }
    inputField.remove();
    selectedSpan.show();

    todoId = parseInt(selectedSpan.parent().prop('id').replace('todo-', ''));
    todo = $.grep(FilteredTodoItems, function(todo, index) {
      if (todo.id == todoId) {
        return todo;
      }
    })[0];
    todo.title = inputField.val();
    updateTodo(todo);
  }

  //Filters
  $('#todo-filter-all, #todo-filter-active, #todo-filter-in-progress, #todo-filter-completed').unbind('click');
  $('#todo-filter-all, #todo-filter-active, #todo-filter-in-progress, #todo-filter-completed').click(function(e) {
    e.preventDefault();

    if ($(this).prop('id').indexOf('all') > -1) {
      FilteredTodoItems = AllTodoItems.slice();
    }
    else if ($(this).prop('id').indexOf('active') > -1) {
      FilteredTodoItems = $.grep(AllTodoItems, function(todo, i) {
        if (todo.status == "active") {
          return todo
        }
      });
    }
    else if ($(this).prop('id').indexOf('in-progress') > -1) {
      FilteredTodoItems = $.grep(AllTodoItems, function(todo, i) {
        if (todo.status == "in_progress") {
          return todo
        }
      });
    }
    else if ($(this).prop('id').indexOf('completed') > -1) {
      FilteredTodoItems = $.grep(AllTodoItems, function(todo, i) {
        if (todo.status == "completed") {
          return todo
        }
      });
    }

    if (FilteredTodoItems.length > 0) {
      $('a.active').removeClass('active');
      $(this).addClass('active');

      refreshTodoList();
    } else {
      FilteredTodoItems = AllTodoItems.slice();
    }
  });

  var addCallbacksToTodoItems = function() {
    $('.todo-title').click(function() {
      var elem = $(this);
      var input = $("<input type='text' class='edit-todo-input' value='" + elem.text() + "' />")

      elem.hide();
      elem.after(input);

      input.prop('selectionStart', elem.text().length);
      input.prop('selectionEnd', elem.text().length);

      input.focus();

      input.blur(function() {
          updateEditInPlaceInputField(elem, input);
      });

      input.keypress(function(e) {
        if (e.which == 13) {
          updateEditInPlaceInputField(elem, input);
        }
      });
    });

    //Update status
    $('[id^="todo-set-active-"], [id^="todo-set-in-progress-"], [id^="todo-set-completed-"]').unbind('click');
    $('[id^="todo-set-active-"], [id^="todo-set-in-progress-"], [id^="todo-set-completed-"]').click(function(e) {
      e.preventDefault();
      var elemId = $(this).prop('id');
      var todoId = 0;
      var newStatus = "";


      if (elemId.indexOf("active") > -1) {
        todoId = parseInt(elemId.replace('todo-set-active-', ''));
        newStatus = "active";
      }
      else if (elemId.indexOf("in-progress") > -1) {
        todoId = parseInt(elemId.replace('todo-set-in-progress-', ''));
        newStatus = "in_progress";
      }
      else if (elemId.indexOf("completed") > -1) {
        todoId = parseInt(elemId.replace('todo-set-completed-', ''));
        newStatus = "completed";
      }


      var todo = $.grep(FilteredTodoItems, function(todo, index) {
        if (todo.id == todoId) {
          return todo
        }
      })[0];

      todo.status = newStatus

      updateTodo(todo);
    });

    //Delete todo
    $('[id^="todo-delete-button-"]').unbind('click');
    $('[id^="todo-delete-button-"]').click(function(e) {
      e.preventDefault();
      todoId = parseInt($(this).prop('id').replace('todo-delete-button-', ''))
      var todo = $.grep(FilteredTodoItems, function(todo, index) {
        if (todo.id == todoId) {
          return todo
        }
      })[0];
      deleteTodo(todo);
    });
  }

  //Get the todo list when the page is loaded
  getTodoList();
  //Focus on the new todo textfield
  $('#todo-input').focus();
})