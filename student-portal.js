import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Frontend-safe Supabase project settings. The publishable key is designed for browser use.
const SUPABASE_URL = 'https://zbjdqumuezksvczekwfr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_PWnJL7JK0uV7gRvAFjrahA_L8dGXGxU';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
let mode = 'login';
const authArea = $('authArea');
const dashboard = $('dashboard');
const message = (text, target = 'authMessage') => { $(target).textContent = text; };

function setMode(next) {
  mode = next;
  $('loginTab').classList.toggle('active', mode === 'login');
  $('signupTab').classList.toggle('active', mode === 'signup');
  $('nameField').classList.toggle('hidden', mode !== 'signup');
  $('submitBtn').textContent = mode === 'signup' ? 'Create account' : 'Sign in';
  $('resetBtn').classList.toggle('hidden', mode !== 'login');
  $('password').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  message('');
}
$('loginTab').addEventListener('click', () => setMode('login'));
$('signupTab').addEventListener('click', () => setMode('signup'));

async function showSession(session) {
  if (!session) {
    authArea.classList.remove('hidden');
    dashboard.classList.add('hidden');
    return;
  }
  const user = session.user;
  $('studentName').textContent = user.user_metadata?.full_name || 'Student';
  $('studentEmail').textContent = user.email || '';
  authArea.classList.add('hidden');
  dashboard.classList.remove('hidden');
}

$('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = $('email').value.trim();
  const password = $('password').value;
  $('submitBtn').disabled = true;
  message(mode === 'signup' ? 'Creating your account…' : 'Signing you in…');
  try {
    if (mode === 'signup') {
      const fullName = $('fullName').value.trim();
      if (!fullName) throw new Error('Please enter your full name.');
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/student-portal.html` }
      });
      if (error) throw error;
      if (data.session) {
        message('Account created. You are signed in.');
        await showSession(data.session);
      } else {
        message('Registration received. Check your inbox and click the verification link before signing in.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      message('Signed in successfully.');
      await showSession(data.session);
    }
  } catch (error) {
    message(error.message || 'Something went wrong. Please try again.');
  } finally {
    $('submitBtn').disabled = false;
  }
});

$('resetBtn').addEventListener('click', async () => {
  const email = $('email').value.trim();
  if (!email) return message('Enter your email address first.');
  message('Sending password recovery email…');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/student-portal.html?reset=1`
  });
  message(error ? error.message : 'If an account exists for that email, a password recovery link has been sent.');
});

$('logoutBtn').addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) message(error.message, 'dashboardMessage');
  else { await showSession(null); message('You have signed out.'); }
});

supabase.auth.onAuthStateChange((_event, session) => { showSession(session); });
const { data: { session } } = await supabase.auth.getSession();
await showSession(session);

// Handle password-reset links delivered by Supabase Auth.
if (new URLSearchParams(window.location.search).get('reset') === '1') {
  const newPassword = prompt('Enter your new password (at least 8 characters):');
  if (newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    message(error ? error.message : 'Your password has been updated.');
  }
  history.replaceState({}, document.title, window.location.pathname);
}
