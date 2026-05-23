import { login } from '@/app/actions';
import { AuthForm } from '../../components/AuthForm';

export default function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <AuthForm
          action={login}
          buttonLabel="Sign in"
          footerText="Don't have an account?"
          footerLabel="Register"
          footerHref="/register"
        />
      </div>
    </div>
  );
}
