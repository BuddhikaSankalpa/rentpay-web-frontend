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
        {/* ලොග් වෙන්න කලින් යන පිටු (Unprotected) */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* ළමයින්ගේ පිටු - ProtectedRoute එකෙන් ආවරණය කරලා තියෙන්නේ */}
        <Route 
          path='/*' 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />

        {/* Admin ගේ පිටු - මේකට role="admin" කියලත් යවනවා */}
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