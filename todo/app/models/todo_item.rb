class TodoItem < ApplicationRecord
	enum status: [ :active, :in_progress, :completed ]
	validates :title, presence: true
end
