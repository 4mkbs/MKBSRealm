import { useCall } from "../../context/CallContext";

const IncomingCallModal = () => {
  const { callState, answerCall, rejectCall } = useCall();

  if (!callState.isReceivingCall || !callState.caller) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={callState.caller.avatar}
              alt={callState.caller.name}
              className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-100"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white">
              {callState.callType === "video" ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-4">
            {callState.caller.name}
          </h3>
          <p className="text-gray-500 mt-1">
            Incoming {callState.callType} call...
          </p>
        </div>

        {/* Animated Rings */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-green-100 animate-ping absolute opacity-75"></div>
            <div className="w-16 h-16 rounded-full bg-green-200 animate-pulse"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-8">
          {/* Decline Button */}
          <button onClick={rejectCall} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition transform hover:scale-105">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-600 mt-2">Decline</span>
          </button>

          {/* Accept Button */}
          <button onClick={answerCall} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition transform hover:scale-105">
              {callState.callType === "video" ? (
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-600 mt-2">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
