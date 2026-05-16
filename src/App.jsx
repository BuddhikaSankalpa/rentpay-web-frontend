import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/homePage'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'
import AdminPage from './pages/adminPage'
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="w-full h-screen">
      <Toaster position="top-right" />

      <Routes>

        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        <Route 
          path='/*' 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path='/admin/*' 
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Routes>

    </div>
  )
}

export default App