class CreateTodoItems < ActiveRecord::Migration[5.1]
  def change
    create_table :todo_items do |t|
      t.string :title
      t.integer :status, default: 0 #0 -> active

      t.timestamps
    end
  end
end
