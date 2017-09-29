require 'test_helper'

class TodosControllerTest < ActionDispatch::IntegrationTest
  test "todo list" do
    get '/v1/todos'
    
    assert_response :success
  end

  test "create should return success" do
    new_todo = {
      'todo' => {
        'title' => 'New todo!!!',
        'status' => 'in_progress'
      }
    }

    post '/v1/todos', params: new_todo
    assert_response :success
  end

  test "create should return error" do
    new_todo = {
      'todo' => {
        'title' => '',
        'status' => 'active'
      }
    }

    post '/v1/todos', params: new_todo
    assert_response 422
  end

  test "update should return success" do
    crash_todo = todo_items(:crash)

    update_todo = {
      'todo' => {
        'status' => 'in_progress'
      }
    }

    patch "/v1/todos/#{crash_todo.id}", params: update_todo
    assert_response :success
  end


  test "update should return error" do
    crash_todo = todo_items(:crash)

    update_todo = {
      'todo' => {
        'title' => '',
        'status' => 'in_progress'
      }
    }

    patch "/v1/todos/#{crash_todo.id}", params: update_todo
    assert_response 422
  end

  test "should delete todo" do
    crash_todo = todo_items(:crash)

    delete "/v1/todos/#{crash_todo.id}"
    assert_response :success
  end
end
