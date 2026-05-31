'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, isAuthed } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isAuthed()) router.replace('/dashboard'); }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (ex) {
      setErr(ex.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h2>ATOB</h2>
        <p className="sub">Admin Control Tower</p>
        {err && <div className="err">{err}</div>}
        <input className="field" type="text" placeholder="Admin email or username"
               value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <input className="field" type="password" placeholder="Password"
               value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
