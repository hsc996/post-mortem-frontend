import { IncidentDesk } from "./components/IncidentDesk/IncidentDesk";
import { LoginScreen } from "./components/Auth/LoginScreen";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { status, user, signIn, signUp, signOut } = useAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm tracking-[0.1em] text-ink-dim">VERIFYING SESSION…</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  return <IncidentDesk currentUser={user} onSignOut={signOut} />;
}

export default App;
