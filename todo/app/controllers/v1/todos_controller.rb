module V1
	class TodosController < ApplicationController

	  def index
	  	@todos = TodoItem.all
	  end

	 	def create
	 		@todo = TodoItem.new(todo_params)
	 		unless @todo.valid?
	 			render json: @todo.errors, code: 422
	 		else
	 			@todo.save
	 		end
	  end

	  def update
	  end

	  def destroy
	  end


		private
			def todo_params
				params.require(:todo).permit(:id, :title, :status)
			end
	end


end
