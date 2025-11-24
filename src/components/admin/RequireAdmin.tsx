import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthed } from '../../utils/auth';

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ok, setOk] = useState<boolean | null>(null);
  const location = useLocation();
  useEffect(() => {
    // Fallback immédiat si déjà authed localement
    if (isAdminAuthed()) {
      setOk(true);
      return;
    }
    const env = (process.env.REACT_APP_BACKEND_URL || '').trim();
    const base = env || (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) ? 'http://localhost:3001' : '');
    (async () => {
      try {
        const prefix = base.replace(/\/$/, '');
        const url = `${prefix}/api/auth/me`;
        const res = await fetch(url, { credentials: 'include' });
        setOk(res.ok);
      } catch {
        setOk(false);
      }
    })();
  }, []);

  if (ok === null) return <></>;
  if (!ok) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};

export default RequireAdmin;
