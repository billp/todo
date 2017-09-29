require 'test_helper'

class TodosTest < ActionDispatch::IntegrationTest
	test "should contains a fixture todo" do
    get '/v1/todos'
    
    todos = json(response.body)
    assert_response :success

    crash_todo = todo_items(:crash)

    assert_includes todos.collect { |todo| todo[:title] }, crash_todo.title
    assert_includes todos.collect { |todo| todo[:status] }, crash_todo.status
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

  test "should display error message for empty title" do
    new_todo = {
      'todo' => {
        'title' => '',
        'status' => 'completed'
      }
    }

    post '/v1/todos', params: new_todo
    assert_response 422

    errors = json(response.body)
    
    assert_includes errors[:title], "can't be blank"
  end

  test "should update status" do
    crash_todo = todo_items(:crash)

    update_todo = {
      'todo' => {
      	'id' => crash_todo.id,
       	'status' => 'in_progress'
      }
    }

    patch "/v1/todos/#{crash_todo.id}", params: update_todo
    assert_response :success

    todo = json(response.body)
    
    assert_equal todo[:status], "in_progress"
  end

  test "should delete todo" do
    crash_todo = todo_items(:crash)

    delete "/v1/todos/#{crash_todo.id}"
    assert_response :success

    #get list again
    get '/v1/todos'
    
    todos = json(response.body)

    crash_todo = todo_items(:crash)
    assert_not_includes todos.collect { |todo| todo[:id] }, crash_todo.id
	end
end