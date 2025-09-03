import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';

const LS_KEYS = {
  TODOS: 'todos',
  SHOW_FINISHED: 'showFinished',
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5h6a.5.5 0 0 0 0-1h-6A1.5 1.5 0 0 0 1 2.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.024l.288 1.154a.5.5 0 0 0 .976-.246l-.288-1.154a.5.5 0 1 0-.976.246m3.428 1.154a.5.5 0 1 0 .976-.246l-.288-1.154a.5.5 0 1 0-.976.246l.288 1.154z"/>
  </svg>
);

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', ...timeOptions }));
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...dateOptions }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-3 sm:p-4">
        <div className="text-2xl sm:text-3xl font-bold tracking-wider">Taskify</div>
        <div className="text-right">
          <div className="font-semibold text-base sm:text-lg">{currentTime}</div>
          <div className="text-xs sm:text-sm">{currentDate}</div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const [todo, setTodo] = useState({ text: "", priority: "medium", dueDate: "" });
  const [todos, setTodos] = useState([]);
  const [showFinished, setShowFinished] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const priorityClasses = {
    high: 'border-l-4 border-red-500',
    medium: 'border-l-4 border-yellow-500',
    low: 'border-l-4 border-green-500',
  };

  useEffect(() => {
  const savedTodos = localStorage.getItem(LS_KEYS.TODOS);
  if (savedTodos) {
    try {
      const parsed = JSON.parse(savedTodos);
      if (Array.isArray(parsed)) {
        setTodos(parsed);
      }
    } catch {
      setTodos([]);
    }
  }
  const savedShow = localStorage.getItem(LS_KEYS.SHOW_FINISHED);
  if (savedShow !== null) {
    setShowFinished(savedShow === "true");
  }
}, []);

useEffect(() => {
  if (todos.length > 0) {
    localStorage.setItem(LS_KEYS.TODOS, JSON.stringify(todos));
  } else {
    localStorage.removeItem(LS_KEYS.TODOS); // avoid storing empty []
  }
}, [todos]);

useEffect(() => {
  localStorage.setItem(LS_KEYS.SHOW_FINISHED, String(showFinished));
}, [showFinished]);

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_KEYS.TODOS && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          if (Array.isArray(next)) setTodos(next);
        } catch {}
      }
      if (e.key === LS_KEYS.SHOW_FINISHED && e.newValue !== null) {
        setShowFinished(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleFinished = () => setShowFinished(!showFinished);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.todo);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim().length < 2) {
      toast.error("Todo must be at least 2 characters.");
      return;
    }
    setTodos(todos.map(t => (t.id === id ? { ...t, todo: editText.trim() } : t)));
    setEditingId(null);
    setEditText('');
    toast.success('Task updated!');
  };

  const handleDelete = (e, id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTodos(todos.filter(item => item.id !== id));
      toast('Task deleted!', { icon: '🗑️' });
    }
  };

  const handleAdd = (e) => {
    if (e) e.preventDefault();

    if (todo.text.trim().length < 2) {
      toast.error("Todo must be at least 2 characters long.");
      return;
    }

    const newTask = {
      id: uuidv4(),
      todo: todo.text.trim(),
      priority: todo.priority,
      dueDate: todo.dueDate,
      isCompleted: false
    };

    setTodos([newTask, ...todos]);
    setTodo({ text: "", priority: "medium", dueDate: "" });
    toast.success('Task added successfully!');
  };

  const handleChange = (e) => {
    setTodo({ ...todo, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    const id = e.target.name;
    setTodos(todos.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item));
  };

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />
      <div className="min-h-screen bg-gray-100 font-sans p-2 sm:p-4">
        <div className="container mx-auto max-w-2xl my-4 sm:my-8 rounded-2xl p-4 sm:p-6 bg-white shadow-2xl transition-all duration-300">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-2 py-3">Taskify</h1>
          <p className="text-center text-gray-500 mb-6 sm:mb-8">Your Ultimate Task Management Solution</p>

          {/* Add Todo */}
          <div className="add-todo my-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3">Add a New Todo</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <input
                name="text"
                onChange={handleChange}
                value={todo.text}
                type="text"
                placeholder="What needs to be done?"
                className="w-full px-5 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 md:col-span-2"
              />
              <input
                name="dueDate"
                onChange={handleChange}
                value={todo.dueDate}
                type="date"
                className="w-full px-5 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
              />
              <select
                name="priority"
                onChange={handleChange}
                value={todo.priority}
                className="w-full px-5 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed md:col-span-2"
                disabled={todo.text.trim().length < 2}
              >
                Save Task
              </button>
            </form>
          </div>

          {/* Show Finished Toggle */}
          <div className='flex items-center gap-3 my-6 bg-gray-50 p-3 rounded-lg'>
            <input onChange={toggleFinished} type="checkbox" checked={showFinished} id="show" className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <label className='font-semibold text-gray-700' htmlFor="show">Show Finished Tasks</label>
          </div>

          <div className='h-[2px] bg-gray-200 w-full mx-auto my-6 rounded-full'></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 text-left mb-4">Your Todos</h2>
          <div className="todos mt-4 space-y-3">
            {todos.length === 0 && <div className='my-5 font-bold text-center text-gray-500'>Your todo list is empty. Add a task to get started!</div>}
            {todos.map(item => (
              (showFinished || !item.isCompleted) && (
                <div key={item.id} className={`todo flex justify-between items-center p-3 sm:p-4 rounded-lg shadow-md transition-all duration-300 ${item.isCompleted ? 'bg-green-50' : 'bg-white'} ${priorityClasses[item.priority]}`}>
                  <div className='flex gap-4 items-center w-full min-w-0'>
                    <input onChange={handleCheckbox} name={item.id} type="checkbox" checked={item.isCompleted} className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"/>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(item.id) }}
                        onBlur={() => handleSaveEdit(item.id)}
                        autoFocus
                        className="w-full text-gray-800 bg-transparent border-b-2 border-blue-500 outline-none"
                      />
                    ) : (
                      <div className="w-full flex flex-col">
                        <span className={`w-full text-gray-800 truncate ${item.isCompleted ? "line-through text-gray-400" : ""}`}>{item.todo}</span>
                        {item.dueDate && <span className={`text-xs text-gray-500 ${item.isCompleted ? "line-through" : ""}`}>{new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}</span>}
                      </div>
                    )}
                  </div>
                  <div className="btn flex gap-2 sm:gap-3 ml-2 sm:ml-4">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-yellow-400 text-white rounded-full transition transform hover:scale-110 hover:bg-yellow-500 shadow-md">
                      <EditIcon />
                    </button>
                    <button onClick={(e) => handleDelete(e, item.id)} className="p-2 bg-red-500 text-white rounded-full transition transform hover:scale-110 hover:bg-red-600 shadow-md">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
