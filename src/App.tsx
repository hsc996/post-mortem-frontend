import { IncidentDesk } from "./components/IncidentDesk/IncidentDesk";
import { LoginScreen } from "./components/Auth/LoginScreen";
import { AcceptInviteScreen } from "./components/Auth/AcceptInviteScreen";
import { useAuth } from "./hooks/useAuth";

const INVITE_PATH_PREFIX = "/invite/";

function App() {
  const { status, user, token, sessionExpired, signIn, signUp, signInWithToken, signOut } = useAuth();

  if (window.location.pathname.startsWith(INVITE_PATH_PREFIX)) {
    const inviteToken = window.location.pathname.slice(INVITE_PATH_PREFIX.length);
    return (
      <AcceptInviteScreen
        token={inviteToken}
        onAccepted={async (accessToken) => {
          await signInWithToken(accessToken);
          window.history.replaceState(null, "", "/");
        }}
      />
    );
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm tracking-[0.1em] text-ink-dim">VERIFYING SESSION…</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !user || !token) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} sessionExpired={sessionExpired} />;
  }

  return <IncidentDesk currentUser={user} token={token} onSignOut={signOut} />;
}

export default App;
