import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Token එකක් ඇත්තටම නැත්නම් හරි, 'undefined' / 'null' කියලා බොරුවට සේව් වෙලා නම් හරි, ලොගින් එකට යවනවා
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }

  // 2. Role එකක් දීලා තියෙනවා නම් (උදා: admin විතරක් යන්න ඕන තැන්) ඒක චෙක් කරනවා
  if (role && userRole !== role) {
    // ළමයෙක් admin පේජ් එකට යන්න හැදුවොත් එයාව ළමයාගේ මුල් පිටුවට යවනවා
    return <Navigate to={userRole === 'admin' ? '/admin' : '/'} replace />;
  }

  return children;
}