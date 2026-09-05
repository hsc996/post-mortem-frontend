import { IncidentDesk } from "./components/IncidentDesk/IncidentDesk";
import { LoginScreen } from "./components/Auth/LoginScreen";
import { AcceptInviteScreen } from "./components/Auth/AcceptInviteScreen";
import { LandingScreen } from "./components/Landing/LandingScreen";
import { useAuth } from "./hooks/useAuth";

const INVITE_PATH_PREFIX = "/invite/";
const LOGIN_PATH = "/login";

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
    if (sessionExpired || window.location.pathname === LOGIN_PATH) {
      const initialMode = new URLSearchParams(window.location.search).get("mode") === "register" ? "register" : "signin";
      return (
        <LoginScreen onSignIn={signIn} onSignUp={signUp} sessionExpired={sessionExpired} initialMode={initialMode} />
      );
    }
    return (
      <LandingScreen
        onSignIn={() => window.location.assign(LOGIN_PATH)}
        onGetStarted={() => window.location.assign(`${LOGIN_PATH}?mode=register`)}
      />
    );
  }

  return <IncidentDesk currentUser={user} token={token} onSignOut={signOut} />;
}

export default App;
