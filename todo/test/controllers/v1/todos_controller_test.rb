require 'test_helper'

class TodosControllerTest < ActionDispatch::IntegrationTest
  test "should contains a fixture todo" do
    get '/v1/todos'
    
    todos = json(response.body)
    assert_response :success

    eggs_todo = todo_items(:eggs)

    assert_equal todos[0][:title], eggs_todo.title
    assert_equal todos[0][:status], eggs_todo.status

  end

  test "should create a new todo" do
    new_todo = {
      'todo' => {
        'title' => 'New todo!!!',
        'status' => 'in_progress'
      }
    }

    post '/v1/todos', params: new_todo
    assert_response :success

    todo = json(response.body)

    assert_equal new_todo['todo']['title'], todo[:title]
    assert_equal new_todo['todo']['status'], todo[:status]

  end
end
