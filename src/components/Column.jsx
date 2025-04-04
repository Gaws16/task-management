import { useTasks } from '../context/TaskContext';
import TaskCard from './TaskCard';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';

function Column({ id, title, color }) {
  const { tasks, moveTask } = useTasks();
  
  // Филтриране на задачите по статус на колоната
  const columnTasks = tasks.filter(task => task.status === id);
  
  // Конфигурация на drag and drop
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item) => moveTask(item.id, id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  return (
    <div 
      ref={drop}
      className={`bg-gray-800 rounded-xl shadow-xl overflow-hidden ${isOver ? 'ring-2 ring-indigo-400' : ''} 
                  transition-all duration-300 flex-1 lg:min-w-72 lg:max-w-80 h-fit`}
    >
      <div className={`${color} h-1.5 w-full`}></div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <span className="bg-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        
        <div className="space-y-3 min-h-40">
          {columnTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
          
          {columnTasks.length === 0 && (
            <div className="text-gray-500 text-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
              Няма задачи
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Column; 