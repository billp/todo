module V1
	class TodosController < ApplicationController

	  def index
	  	@todos = TodoItem.all
	  end

	 	def create
	 		@todo = TodoItem.new(todo_params)

	 		unless @todo.valid?
	 			render json: @todo.errors, status: 422
	 		else
	 			@todo.save
	 		end
	  end

	  def update
	  	@todo = TodoItem.find(params[:id])

	  	if @todo.update_attributes(todo_params)
	  		@todo.reload
	  	else
	  		render json: @todo.errors, status: 422
	  	end
	  end

	  def destroy
	  	todo = TodoItem.find(params[:id])
	  	todo.destroy
	  end


		private
			def todo_params
				params.require(:todo).permit(:id, :title, :status)
			end
	end
end
