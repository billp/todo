require 'test_helper'

class TodoItemTest < ActiveSupport::TestCase
  test "should not save todo item without a title" do
    todo = TodoItem.new
    assert_not todo.save
  end
end
