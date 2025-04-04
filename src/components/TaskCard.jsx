import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useTasks } from '../context/TaskContext';
import TaskModal from './TaskModal';
import { motion } from 'framer-motion';

function TaskCard({ task }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Конфигурация за drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Цветове за различните приоритети
  const priorityColors = {
    high: 'bg-gradient-to-r from-red-500 to-orange-500',
    medium: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    low: 'bg-gradient-to-r from-green-500 to-emerald-500',
  };
  
  // Превод на приоритети
  const priorityLabels = {
    high: 'Висок',
    medium: 'Среден',
    low: 'Нисък',
  };
  
  return (
    <>
      <div 
        ref={drag}
        onClick={() => setIsModalOpen(true)}
        className={`bg-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-600 transition-all duration-200 
                   shadow-lg hover:shadow-xl ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'} transform hover:-translate-y-1`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {/* Линия за приоритет */}
        <div className={`h-1 w-full ${priorityColors[task.priority]} rounded-full mb-2.5`}></div>
        
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-medium text-sm flex-1">{task.title}</h4>
          <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-full font-medium ${
            task.priority === 'high' ? 'bg-red-900 text-red-200' :
            task.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
            'bg-green-900 text-green-200'
          }`}>
            {priorityLabels[task.priority]}
          </span>
        </div>
        
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
        
        {task.assignee && (
          <div className="flex items-center mt-2 bg-gray-800 rounded-lg p-2">
            <img 
              src={task.assignee.avatar} 
              alt={task.assignee.name}
              className="h-7 w-7 rounded-full border-2 border-gray-600" 
            />
            <span className="text-gray-300 text-xs ml-2 font-medium truncate">{task.assignee.name}</span>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <TaskModal task={task} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

export default TaskCard; 