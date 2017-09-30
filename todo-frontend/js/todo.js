$(function() {
	var API_VERSION = "1"
	var API_ENDPOINT = "http://localhost:3000/v" + API_VERSION 

	var APICallCommand = {
		"getList": 1,
		"createTodo": 2,
		"updateTodo": 3,
		"deleteTodo": 4
	}

	var CurrentTodoList = []

	//AJAX generic function
	var apiCall = function(command, 
												 obj, 
												 successCb = function(){}, 
												 errorCb = function(){ alert("Something went wrong!!!") }) {
		var path = ""
		var method = ""
		
		if (command == APICallCommand.getList) {
			path += "/todos"
			method = "get"
		}
		else if (command == APICallCommand.createTodo) {
			path += "/todos"
			method = "post"
		}
		else if (command == APICallCommand.updateTodo) {
			path += "/todos/" + obj.todo.id
			method = "patch"
		}
		else if (command == APICallCommand.deleteTodo) {
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

	//API Methods
	var getTodoList = function() {
		apiCall(APICallCommand.getList, null, 
			function(data) {
				CurrentTodoList = data
	      var template = $.templates("#todo-item-template");
	      $('.todo-list').html(template.render(CurrentTodoList))
	      addCallbacksToTodoItems()
			}
		)
	}

	var createTodo = function(title, finishCb = function() {}) {
		var newTodo = {
			"todo": {
				title: title
			}
		}

		apiCall(APICallCommand.createTodo, newTodo, 
			function(data) {
				CurrentTodoList.push(data)
				var template = $.templates("#todo-item-template");
	      $('.todo-list').append(template.render(data));
	      finishCb(data);
			}
		)
	}

	var updateTodo = function(todo, finishCb = function() {}) {

		apiCall(APICallCommand.updateTodo, {"todo": todo}, 
			function(data) {
				console.log(data);
				todoData = $.grep(CurrentTodoList, function(todo, index) {
					if (data.id == todo.id) {
						return {'todo': todo, 'index': index}
					}
				})[0];
				CurrentTodoList[todoData.index] = todoData.todo
	      finishCb(data);
			}
		)
	}

	$('#todo-input').keypress(function(e) {
		if (e.which == 13) {
			createTodo($(this).val(), function() {
				$('#todo-input').val('');
			});
		}
	});

	//Edit todo in-place

	var updateEditInPlaceInputField = function(selectedSpan, inputField) {
    if (inputField.val() != "") {
      selectedSpan.text(inputField.val());
    }
    inputField.remove();
    selectedSpan.show();

    todoIndex = parseInt(selectedSpan.parent().prop('id').replace('todo-', '')-1);
    todo = CurrentTodoList[todoIndex]
    todo.title = inputField.val()
    updateTodo(todo)
	}

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
          updateEditInPlaceInputField(elem, input)
      });

      input.keypress(function(e) {
      	if (e.which == 13) {
      		updateEditInPlaceInputField(elem, input)
        }
      });
		})
	}


	getTodoList();
})