4everTRADERS Academy — Student Authentication Release

CONTENTS
- index.html: existing TM_Capital Global website, updated with Student Portal links.
- student-portal.html: student registration/login interface.
- student-portal.js: Supabase Auth integration (email/password, verification flow, sign-out, password recovery).

IMPORTANT: This is the first authentication release. The dashboard is a signed-in landing area only. Course enrolment, video hosting, paid memberships, downloadable materials and persistent progress tracking are NOT yet implemented.

DEPLOYMENT
1. Download and extract the ZIP.
2. Replace the matching files in the root of your existing GitHub repository with these three files.
3. Commit/push the changes. Vercel should automatically deploy from the connected repository.
4. In Supabase, open Authentication > URL Configuration.
   - Site URL: https://www.tmcapitalglobal.com
   - Add Redirect URLs:
     https://www.tmcapitalglobal.com/**
     https://tmcapitalglobal.com/**
5. In Authentication > Sign In / Providers > Email, ensure Email is enabled and Confirm email is ON.
6. In Authentication > Email Templates, check that the confirmation email uses the Supabase confirmation URL variable (the default template normally does).
7. Test on the live domain: register using an email address you can access, verify the email, sign in, then sign out.

SECURITY
- The Supabase publishable key is intentionally used in browser code. It is not a secret key.
- Never add the Supabase secret/service_role key or database password to this repository.
- Do not store sensitive student information in browser code. Any future database tables must use Row Level Security policies.

If email confirmation links do not return to the portal, verify the Redirect URLs and the confirmation email template in Supabase.
