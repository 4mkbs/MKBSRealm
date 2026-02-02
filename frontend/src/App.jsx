import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SocketProvider } from "./context/SocketContext";
import { CallProvider } from "./context/CallContext";
import AppRoutes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import IncomingCallModal from "./components/messenger/IncomingCallModal";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <CallProvider>
              <AppRoutes />
              <IncomingCallModal />
            </CallProvider>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
