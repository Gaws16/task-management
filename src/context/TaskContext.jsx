import { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Създаваме контекст за задачите
const TaskContext = createContext();

// Списък с възможни статуси на задачите
const STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  DONE: 'done'
};

// Списък с потребители (вместо база данни)
const USERS = [
  { id: 1, name: 'Иван Иванов', avatar: 'https://i.pravatar.cc/300?img=1' },
  { id: 2, name: 'Мария Петрова', avatar: 'https://i.pravatar.cc/300?img=5' },
  { id: 3, name: 'Георги Димитров', avatar: 'https://i.pravatar.cc/300?img=3' },
  { id: 4, name: 'Елена Тодорова', avatar: 'https://i.pravatar.cc/300?img=9' },
];

// Начални тестови задачи
const INITIAL_TASKS = [
  {
    id: uuidv4(),
    title: 'Създаване на дизайн система',
    description: 'Разработване на компоненти и стилове за приложението',
    status: STATUSES.TODO,
    assignee: USERS[0],
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Имплементиране на drag-and-drop функционалност',
    description: 'Интегриране на библиотека за drag-and-drop и настройка на логиката',
    status: STATUSES.IN_PROGRESS,
    assignee: USERS[1],
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Тестване на потребителския интерфейс',
    description: 'Проверка на всички интеракции и изгледи на различни устройства',
    status: STATUSES.TESTING,
    assignee: USERS[2],
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Оптимизация на производителността',
    description: 'Анализ и подобрение на скоростта на зареждане и интеракциите',
    status: STATUSES.DONE,
    assignee: USERS[3],
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
];

export function TaskProvider({ children }) {
  // Зареждане на задачите от localStorage или използване на начални тестови задачи
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      // Проверка дали имаме валидни данни и дали са масив
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
          return parsedTasks;
        }
      }
      // Ако няма данни или данните не са масив, връщаме началните задачи
      return INITIAL_TASKS;
    } catch (error) {
      console.error('Грешка при зареждане на задачите:', error);
      return INITIAL_TASKS;
    }
  });
  
  // Записване на задачите в localStorage при промяна
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Грешка при запазване на задачите:', error);
    }
  }, [tasks]);

  // Добавяне на нова задача
  const addTask = (task) => {
    const newTask = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...task
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Обновяване на съществуваща задача
  const updateTask = (updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  // Изтриване на задача
  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Промяна на статуса на задача
  const moveTask = (taskId, newStatus) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Стойности, предоставени от контекста
  const value = {
    tasks,
    statuses: STATUSES,
    users: USERS,
    addTask,
    updateTask,
    deleteTask,
    moveTask
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// Помощна функция за използване на контекста
export const useTasks = () => useContext(TaskContext);

export default TaskContext; 