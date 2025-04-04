import { useTasks } from '../context/TaskContext';
import Column from './Column';

function Board() {
  const { statuses } = useTasks();
  
  // Конфигурация на колоните
  const columns = [
    { id: statuses.TODO, title: 'За изпълнение', color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
    { id: statuses.IN_PROGRESS, title: 'В процес', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { id: statuses.TESTING, title: 'Тестване', color: 'bg-gradient-to-r from-purple-500 to-fuchsia-500' },
    { id: statuses.DONE, title: 'Завършено', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  ];
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-600">Табло със задачи</h2>
      
      <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <Column 
            key={column.id} 
            id={column.id} 
            title={column.title} 
            color={column.color} 
          />
        ))}
      </div>
    </div>
  );
}

export default Board; 