import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
        <div className="w-full max-w-md animate-pulse">
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
